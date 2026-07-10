import { Role } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { SEED_ARTICLES, SEED_GAMES } from './seedData';

dotenv.config();

const SALT_ROUNDS = 12;

async function seed(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Подключено к PostgreSQL');

    await prisma.payment.deleteMany();
    await prisma.review.deleteMany();
    await prisma.game.deleteMany();
    await prisma.article.deleteMany();
    await prisma.user.deleteMany();
    console.log('Таблицы очищены');

    const adminHash = await bcrypt.hash('admin123', SALT_ROUNDS);
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@andrlol.local',
        passwordHash: adminHash,
        role: Role.admin,
      },
    });
    console.log('Админ: admin@andrlol.local / admin123');

    const userHash = await bcrypt.hash('user123', SALT_ROUNDS);
    const testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'user@andrlol.local',
        passwordHash: userHash,
        role: Role.user,
      },
    });
    console.log('Пользователь: user@andrlol.local / user123');

    const premiumHash = await bcrypt.hash('premium123', SALT_ROUNDS);
    const premiumUser = await prisma.user.create({
      data: {
        username: 'gamer_pro',
        email: 'premium@andrlol.local',
        passwordHash: premiumHash,
        role: Role.premium,
      },
    });

    await prisma.review.createMany({
      data: [
        {
          userId: testUser.id,
          rating: 5,
          text: 'Помог настроить CS2 — FPS вырос с 180 до 320. Гайды понятные, всё по делу!',
        },
        {
          userId: premiumUser.id,
          rating: 5,
          text: 'Премиум-материалы реально стоят своих денег. Конфиги под моё железо сработали идеально.',
        },
      ],
    });
    console.log('Отзывов: 2');

    await prisma.article.createMany({ data: SEED_ARTICLES });
    const premiumCount = SEED_ARTICLES.filter((a) => a.isPremium).length;
    console.log(`Статей: ${SEED_ARTICLES.length} (премиум: ${premiumCount})`);

    await prisma.game.createMany({ data: SEED_GAMES });
    console.log(`Игр: ${SEED_GAMES.length}`);

    console.log('✅ Seed завершён!');
  } catch (error) {
    console.error('Ошибка seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
