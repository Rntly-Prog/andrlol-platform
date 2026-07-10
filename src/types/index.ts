import { Role } from '@prisma/client';

/** Роли пользователей (enum из Prisma) */
export type UserRole = Role;

/** Расширение Express Request — текущий пользователь из JWT */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export {};
