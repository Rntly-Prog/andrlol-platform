import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/** Обработчик результатов express-validator */
export function handleValidation(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const isApi = req.originalUrl.startsWith('/api');
    if (isApi) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const firstError = errors.array()[0];
    res.status(400).render('pages/error', {
      title: 'Ошибка валидации',
      message: firstError.msg,
      statusCode: 400,
    });
    return;
  }
  next();
}

/** Валидация для форм авторизации — возвращает на страницу входа */
export function handleAuthValidation(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    const isVerify = req.path.includes('reset-password');
    res.render('pages/auth/login', {
      title: 'Вход',
      resetStep: isVerify ? 'verify' : 'request',
      resetEmail: req.body.email || '',
      error: firstError.msg,
      form: { email: req.body.email },
      redirect: req.body.redirect || '/',
    });
    return;
  }
  next();
}

/** Запуск цепочки валидации */
export function validate(
  validations: ValidationChain[],
  handler: (req: Request, res: Response, next: NextFunction) => void = handleValidation
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((v) => v.run(req)));
    handler(req, res, next);
  };
}
