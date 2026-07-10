import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { env } from '../config/env';

function redirectAdminUploadError(req: Request, res: Response, message: string): boolean {
  if (req.originalUrl.includes('/admin/author')) {
    res.redirect(`/admin/author?flash=${encodeURIComponent(message)}`);
    return true;
  }
  if (req.originalUrl.includes('/admin/games')) {
    res.redirect(`/admin/games?flash=${encodeURIComponent(message)}`);
    return true;
  }
  return false;
}

/** Глобальный обработчик ошибок Express */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Ошибка:', err);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Файл слишком большой. Максимум 5 МБ.'
        : 'Ошибка загрузки файла';

    if (req.originalUrl.startsWith('/api')) {
      res.status(400).json({ error: message });
      return;
    }

    if (redirectAdminUploadError(req, res, message)) return;
  }

  if (err.message.includes('Допустимы только изображения')) {
    if (req.originalUrl.startsWith('/api')) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (redirectAdminUploadError(req, res, err.message)) return;
  }

  const isApi = req.originalUrl.startsWith('/api');

  if (isApi) {
    res.status(500).json({
      error: env.isDev ? err.message : 'Внутренняя ошибка сервера',
    });
    return;
  }

  res.status(500).render('pages/error', {
    title: 'Ошибка сервера',
    message: env.isDev ? err.message : 'Произошла внутренняя ошибка. Попробуйте позже.',
    statusCode: 500,
  });
}

/** Обработчик 404 */
export function notFoundHandler(req: Request, res: Response): void {
  const isApi = req.originalUrl.startsWith('/api');

  if (isApi) {
    res.status(404).json({ error: 'Маршрут не найден' });
    return;
  }

  res.status(404).render('pages/error', {
    title: 'Страница не найдена',
    message: `Маршрут ${req.path} не существует.`,
    statusCode: 404,
  });
}
