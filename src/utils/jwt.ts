import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../types';

export interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

/** Генерация JWT-токена для пользователя */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

/** Верификация JWT-токена */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

/** Проверка, имеет ли роль доступ к премиум-контенту */
export function hasPremiumAccess(role: UserRole): boolean {
  return role === 'premium' || role === 'admin';
}

/** Человекочитаемое название роли */
export function roleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    user: 'Пользователь',
    premium: 'Премиум',
    admin: 'Администратор',
  };
  return labels[role];
}
