import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

/** Web: страница игр */
export async function listGamesPage(_req: Request, res: Response): Promise<void> {
  const games = await prisma.game.findMany({ orderBy: { createdAt: 'desc' } });
  res.render('pages/games', {
    title: 'Игры',
    games,
  });
}
