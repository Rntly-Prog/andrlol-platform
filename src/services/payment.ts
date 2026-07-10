import { PaymentStatus, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { PREMIUM } from '../constants/premium';
import { signToken } from '../utils/jwt';

/** Активировать премиум после успешной оплаты */
export async function activatePremium(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { role: Role.premium },
  });
}

/** Обновить JWT-cookie после смены роли */
export function refreshUserCookie(
  res: { cookie: (name: string, value: string, options: object) => void },
  user: { id: string; username: string; email: string; role: Role }
): void {
  const token = signToken({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  });
}

/** Завершить платёж и выдать премиум */
export async function completePayment(paymentId: string, yookassaId?: string): Promise<boolean> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status === PaymentStatus.succeeded) {
    return false;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.succeeded,
        completedAt: new Date(),
        ...(yookassaId ? { yookassaId } : {}),
      },
    }),
    prisma.user.update({
      where: { id: payment.userId },
      data: { role: Role.premium },
    }),
  ]);

  return true;
}

/** Создать запись о платеже в БД */
export async function createPaymentRecord(userId: string, yookassaId: string) {
  return prisma.payment.create({
    data: {
      userId,
      yookassaId,
      amount: PREMIUM.price,
      currency: PREMIUM.currency,
      status: PaymentStatus.pending,
      description: PREMIUM.title,
    },
  });
}

/** Найти платёж по ID ЮKassa */
export async function findPaymentByYookassaId(yookassaId: string) {
  return prisma.payment.findUnique({ where: { yookassaId } });
}
