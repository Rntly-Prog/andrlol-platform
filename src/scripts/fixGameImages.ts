import dotenv from 'dotenv';
import { prisma } from '../lib/prisma';
import { SEED_GAMES } from './seedData';

dotenv.config();

/** Обновляет imageUrl у существующих игр по названию (без пересоздания БД) */
async function fixGameImages(): Promise<void> {
  for (const game of SEED_GAMES) {
    const updated = await prisma.game.updateMany({
      where: { title: game.title },
      data: { imageUrl: game.imageUrl },
    });
    if (updated.count > 0) {
      console.log(`✓ ${game.title} → ${game.imageUrl}`);
    }
  }
  console.log('Готово');
}

fixGameImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
