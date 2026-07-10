import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

/** Singleton Prisma Client (избегаем множественных подключений в dev) */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDev ? ['error', 'warn'] : ['error'],
  });

if (env.isDev) {
  globalForPrisma.prisma = prisma;
}
