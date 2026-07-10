import { Request, Response, NextFunction } from 'express';
import { PREMIUM } from '../constants/premium';
import { env } from '../config/env';
import { roleLabel } from '../utils/jwt';
import { getAuthorData } from '../services/author';

/** Передаёт общие данные во все EJS-шаблоны */
export async function localsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  res.locals.user = req.user || null;
  res.locals.isAuthenticated = !!req.user;
  res.locals.roleLabel = req.user ? roleLabel(req.user.role) : null;
  res.locals.author = await getAuthorData();
  res.locals.premium = PREMIUM;
  res.locals.yukassaConfigured = env.yukassaConfigured;
  res.locals.isDev = env.isDev;
  res.locals.currentPath = req.path;
  res.locals.flash = req.query.flash || null;
  res.locals.error = req.query.error || null;
  next();
}
