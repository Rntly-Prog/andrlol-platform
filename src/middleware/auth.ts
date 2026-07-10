import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UserRole } from '../types';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';

const authCookieOptions = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: 'lax' as const,
  secure: !env.isDev,
};

/** Загружает пользователя из БД по JWT; null — если токен устарел или пользователь удалён */
async function resolveUserFromToken(token: string) {
  const payload = verifyToken(token);
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, username: true, email: true, role: true },
  });
  return user;
}

function clearAuthCookie(res: Response): void {
  res.clearCookie('token', authCookieOptions);
}

/** Проверка, является ли запрос API-вызовом */
function isApiRequest(req: Request): boolean {
  return req.originalUrl.startsWith('/api');
}

/**
 * Извлекает JWT из заголовка Authorization или cookie.
 * Формат заголовка: Bearer <token>
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  return null;
}

/**
 * Опциональная авторизация — заполняет req.user, если токен валиден.
 * Не блокирует запрос при отсутствии токена.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req);
  if (token) {
    try {
      const user = await resolveUserFromToken(token);
      if (user) {
        req.user = user;
      } else {
        clearAuthCookie(res);
      }
    } catch {
      clearAuthCookie(res);
    }
  }
  next();
}

/**
 * Обязательная авторизация — возвращает 401 без валидного токена.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req);
  if (!token) {
    if (isApiRequest(req)) {
      res.status(401).json({ error: 'Требуется авторизация' });
      return;
    }
    res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
    return;
  }

  try {
    const user = await resolveUserFromToken(token);
    if (!user) {
      clearAuthCookie(res);
      if (isApiRequest(req)) {
        res.status(401).json({ error: 'Сессия устарела, войдите снова' });
        return;
      }
      res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl) + '&flash=' + encodeURIComponent('Сессия устарела, войдите снова'));
      return;
    }
    req.user = user;
    next();
  } catch {
    clearAuthCookie(res);
    if (isApiRequest(req)) {
      res.status(401).json({ error: 'Недействительный токен' });
      return;
    }
    res.redirect('/login');
  }
}

/**
 * Доступ только для premium и admin.
 */
export function premiumMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    if (isApiRequest(req)) {
      res.status(401).json({ error: 'Требуется авторизация' });
      return;
    }
    res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
    return;
  }

  if (req.user.role !== 'premium' && req.user.role !== 'admin') {
    if (isApiRequest(req)) {
      res.status(403).json({ error: 'Требуется премиум-подписка' });
      return;
    }
    res.status(403).render('pages/error', {
      title: 'Доступ запрещён',
      message: 'Этот раздел доступен только для премиум-пользователей.',
      statusCode: 403,
    });
    return;
  }

  next();
}

/**
 * Доступ только для admin.
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    if (isApiRequest(req)) {
      res.status(401).json({ error: 'Требуется авторизация' });
      return;
    }
    res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
    return;
  }

  if (req.user.role !== 'admin') {
    if (isApiRequest(req)) {
      res.status(403).json({ error: 'Требуется роль администратора' });
      return;
    }
    res.status(403).render('pages/error', {
      title: 'Доступ запрещён',
      message: 'Админ-панель доступна только администраторам.',
      statusCode: 403,
    });
    return;
  }

  next();
}

/** Проверка роли для использования в шаблонах */
export function isPremiumRole(role: UserRole): boolean {
  return role === 'premium' || role === 'admin';
}
