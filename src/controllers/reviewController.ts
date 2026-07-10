import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function submitReview(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const rating = Number.parseInt(String(req.body.rating), 10);
  const text = String(req.body.text).trim();

  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userExists) {
    res.redirect('/login?redirect=/#reviews&flash=' + encodeURIComponent('Сессия устарела, войдите снова'));
    return;
  }

  await prisma.review.upsert({
    where: { userId },
    create: { userId, rating, text },
    update: { rating, text },
  });

  res.redirect('/?flash=Спасибо за отзыв!#reviews');
}

export async function deleteOwnReview(req: Request, res: Response): Promise<void> {
  await prisma.review.deleteMany({ where: { userId: req.user!.id } });
  res.redirect('/?flash=Отзыв удалён#reviews');
}
