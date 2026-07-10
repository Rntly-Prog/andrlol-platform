import { prisma } from '../lib/prisma';

/** Проверка подключения к PostgreSQL */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL подключена');
  } catch (error) {
    console.error('❌ Ошибка подключения к PostgreSQL:', error);
    process.exit(1);
  }
}
