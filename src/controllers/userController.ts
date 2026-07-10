import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { roleLabel } from '../utils/jwt';
import { PREMIUM } from '../constants/premium';
import { env } from '../config/env';

/** Web: главная страница */
export async function home(req: Request, res: Response): Promise<void> {
  const [latestArticles, premiumCount, reviews, reviewAggregate, userReview] = await Promise.all([
    prisma.article.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.article.count({ where: { isPremium: true } }),
    prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { username: true, role: true } },
      },
    }),
    prisma.review.aggregate({ _avg: { rating: true }, _count: { rating: true } }),
    req.user
      ? prisma.review.findUnique({ where: { userId: req.user.id } })
      : Promise.resolve(null),
  ]);

  const avgRating = reviewAggregate._avg.rating
    ? Math.round(reviewAggregate._avg.rating * 10) / 10
    : 0;

  res.render('pages/home', {
    title: 'Главная',
    latestArticles,
    premiumCount,
    premium: PREMIUM,
    reviews,
    reviewStats: {
      average: avgRating,
      count: reviewAggregate._count.rating,
    },
    userReview,
  });
}

/** Web: об авторе */
export function about(_req: Request, res: Response): void {
  res.render('pages/about', {
    title: 'Об авторе',
  });
}

/** Web: личный кабинет */
export async function profile(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.redirect('/logout');
    return;
  }

  const lastPayment = await prisma.payment.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  res.render('pages/profile', {
    title: 'Личный кабинет',
    profile: user,
    roleLabel: roleLabel(user.role),
    premium: PREMIUM,
    yukassaConfigured: env.yukassaConfigured,
    isDev: env.isDev,
    lastPayment,
  });
}
