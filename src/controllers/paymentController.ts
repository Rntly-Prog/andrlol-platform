import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { PREMIUM } from '../constants/premium';
import { prisma } from '../lib/prisma';
import { createPremiumPayment, getPayment } from '../services/yookassa';
import {
  activatePremium,
  completePayment,
  createPaymentRecord,
  findPaymentByYookassaId,
  refreshUserCookie,
} from '../services/payment';

/** Публичная страница премиум-подписки */
export function premiumLandingPage(req: Request, res: Response): void {
  res.render('pages/premium-landing', {
    title: 'Премиум-подписка',
    premium: PREMIUM,
    isAuthenticated: !!req.user,
    hasPremium: req.user?.role === Role.premium || req.user?.role === Role.admin,
    yukassaConfigured: env.yukassaConfigured,
    isDev: env.isDev,
  });
}

/** Страница оформления премиума */
export async function premiumCheckoutPage(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.redirect('/login?redirect=/premium/checkout');
    return;
  }

  if (req.user.role === Role.premium || req.user.role === Role.admin) {
    res.redirect('/articles/premium');
    return;
  }

  res.render('pages/premium-checkout', {
    title: 'Премиум-подписка',
    premium: PREMIUM,
    yukassaConfigured: env.yukassaConfigured,
    isDev: env.isDev,
  });
}

/** Web: создать платёж и перенаправить на ЮKassa */
export async function createPaymentWeb(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    res.redirect('/logout');
    return;
  }

  if (user.role !== Role.user) {
    res.redirect('/profile');
    return;
  }

  if (!env.yukassaConfigured) {
    if (env.isDev) {
      res.redirect('/payments/demo');
      return;
    }
    res.status(503).render('pages/error', {
      title: 'Оплата недоступна',
      message: 'Платёжная система не настроена. Добавьте YUKASSA_SHOP_ID и YUKASSA_SECRET_KEY в .env',
      statusCode: 503,
    });
    return;
  }

  try {
    const yooPayment = await createPremiumPayment(user.id, user.email);
    await createPaymentRecord(user.id, yooPayment.id);

    const payUrl = yooPayment.confirmation?.confirmation_url;
    if (!payUrl) {
      throw new Error('Не получена ссылка на оплату');
    }

    res.redirect(payUrl);
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    res.redirect('/profile?error=Не удалось создать платёж. Попробуйте позже.');
  }
}

/** API: создать платёж */
export async function createPaymentApi(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return;
  }

  if (user.role !== Role.user) {
    res.status(400).json({ error: 'Премиум уже активен' });
    return;
  }

  if (!env.yukassaConfigured) {
    res.status(503).json({ error: 'ЮKassa не настроена' });
    return;
  }

  try {
    const yooPayment = await createPremiumPayment(user.id, user.email);
    await createPaymentRecord(user.id, yooPayment.id);
    res.json({
      paymentId: yooPayment.id,
      confirmationUrl: yooPayment.confirmation?.confirmation_url,
      amount: PREMIUM.price,
      currency: PREMIUM.currency,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Ошибка оплаты' });
  }
}

/** Страница успешной оплаты */
export async function paymentSuccessPage(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.redirect('/login');
    return;
  }

  const pending = await prisma.payment.findFirst({
    where: { userId: req.user.id, status: 'pending' },
    orderBy: { createdAt: 'desc' },
  });

  if (pending?.yookassaId && env.yukassaConfigured) {
    try {
      const yooPayment = await getPayment(pending.yookassaId);
      if (yooPayment.status === 'succeeded' && yooPayment.paid) {
        await completePayment(pending.id, yooPayment.id);
        const updated = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (updated) refreshUserCookie(res, updated);
      }
    } catch (error) {
      console.error('Проверка платежа:', error);
    }
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (user?.role === Role.premium) {
    refreshUserCookie(res, user);
    res.render('pages/payments/success', {
      title: 'Оплата успешна',
      premium: PREMIUM,
    });
    return;
  }

  res.render('pages/payments/pending', {
    title: 'Обработка платежа',
    message: 'Платёж обрабатывается. Премиум активируется в течение нескольких минут.',
  });
}

/** Webhook ЮKassa */
export async function yookassaWebhook(req: Request, res: Response): Promise<void> {
  const event = req.body as {
    event?: string;
    object?: { id: string; status: string; paid: boolean; metadata?: { userId?: string } };
  };

  if (event.event === 'payment.succeeded' && event.object?.paid) {
    const yookassaId = event.object.id;
    const payment = await findPaymentByYookassaId(yookassaId);

    if (payment) {
      await completePayment(payment.id, yookassaId);
    } else if (event.object.metadata?.userId) {
      await activatePremium(event.object.metadata.userId);
    }
  }

  res.status(200).send('OK');
}

/** Dev: демо-оплата без ЮKassa */
export async function demoPaymentWeb(req: Request, res: Response): Promise<void> {
  if (!env.isDev) {
    res.status(404).render('pages/error', {
      title: 'Не найдено',
      message: 'Страница недоступна',
      statusCode: 404,
    });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user || user.role !== Role.user) {
    res.redirect('/profile');
    return;
  }

  await prisma.payment.create({
    data: {
      userId: user.id,
      amount: PREMIUM.price,
      status: 'succeeded',
      completedAt: new Date(),
      description: 'Демо-оплата (dev)',
    },
  });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: Role.premium },
  });

  refreshUserCookie(res, updated);
  res.redirect('/payments/success');
}
