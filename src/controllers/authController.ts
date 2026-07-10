import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { signToken } from '../utils/jwt';
import { env } from '../config/env';
import { sendPasswordResetCode } from '../services/email';

const SALT_ROUNDS = 12;
const RESET_CODE_TTL_MS = 15 * 60 * 1000;

function generateResetCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const authCookieOptions = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: 'lax' as const,
  secure: !env.isDev,
};

/** POST /api/auth/register */
export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password } = req.body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    res.status(409).json({ error: 'Пользователь с таким email или именем уже существует' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { username, email, passwordHash },
  });

  const token = signToken({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}

/** POST /api/auth/login */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: 'Неверный email или пароль' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Неверный email или пароль' });
    return;
  }

  const token = signToken({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}

/** Web: форма регистрации */
export function showRegister(req: Request, res: Response): void {
  if (req.user) {
    res.redirect('/profile');
    return;
  }
  res.render('pages/auth/register', { title: 'Регистрация', redirect: req.query.redirect || '/' });
}

/** Web: обработка регистрации */
export async function handleRegister(req: Request, res: Response): Promise<void> {
  const { username, email, password, redirect } = req.body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    res.render('pages/auth/register', {
      title: 'Регистрация',
      error: 'Пользователь с таким email или именем уже существует',
      form: { username, email },
      redirect: redirect || '/',
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { username, email, passwordHash },
  });

  const token = signToken({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });

  res.cookie('token', token, authCookieOptions);

  res.redirect(redirect || '/profile?flash=Добро пожаловать!');
}

/** Web: форма входа */
export function showLogin(req: Request, res: Response): void {
  if (req.user) {
    res.redirect('/profile');
    return;
  }
  res.render('pages/auth/login', {
    title: 'Вход',
    redirect: req.query.redirect || '/',
    error: req.query.error,
    flash: req.query.flash || null,
    resetStep: req.query.reset || null,
    resetEmail: req.query.email || '',
    success: req.query.success || null,
  });
}

/** Web: обработка входа */
export async function handleLogin(req: Request, res: Response): Promise<void> {
  const { email, password, redirect } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.render('pages/auth/login', {
      title: 'Вход',
      error: 'Неверный email или пароль',
      form: { email },
      redirect: redirect || '/',
    });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.render('pages/auth/login', {
      title: 'Вход',
      error: 'Неверный email или пароль',
      form: { email },
      redirect: redirect || '/',
    });
    return;
  }

  const token = signToken({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });

  res.cookie('token', token, authCookieOptions);

  res.redirect(redirect || (user.role === 'admin' ? '/admin' : '/profile'));
}

/** Web: выход */
export function logout(_req: Request, res: Response): void {
  res.clearCookie('token');
  res.redirect('/?flash=Вы вышли из аккаунта');
}

/** Web: запрос кода восстановления пароля */
export async function requestPasswordReset(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.render('pages/auth/login', {
      title: 'Вход',
      resetStep: 'request',
      error: 'Аккаунт с таким email не найден',
      form: { email },
      redirect: req.body.redirect || '/',
    });
    return;
  }

  const code = generateResetCode();
  const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MS);

  await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
  await prisma.passwordReset.create({
    data: { userId: user.id, code, expiresAt },
  });

  try {
    await sendPasswordResetCode(email, code);
  } catch (err) {
    console.error('[password-reset] Ошибка отправки email:', err);
    res.render('pages/auth/login', {
      title: 'Вход',
      resetStep: 'request',
      error: 'Не удалось отправить письмо. Попробуйте позже.',
      form: { email },
      redirect: req.body.redirect || '/',
    });
    return;
  }

  res.render('pages/auth/login', {
    title: 'Вход',
    resetStep: 'verify',
    resetEmail: email,
    success: env.smtpConfigured
      ? 'Код отправлен на вашу почту. Проверьте входящие.'
      : 'Код сгенерирован (SMTP не настроен — смотрите консоль сервера).',
    redirect: req.body.redirect || '/',
  });
}

/** Web: сброс пароля по коду */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { email, code, password, redirect } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.render('pages/auth/login', {
      title: 'Вход',
      resetStep: 'verify',
      resetEmail: email,
      error: 'Аккаунт с таким email не найден',
      redirect: redirect || '/',
    });
    return;
  }

  const resetRecord = await prisma.passwordReset.findFirst({
    where: { userId: user.id, code },
    orderBy: { createdAt: 'desc' },
  });

  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    res.render('pages/auth/login', {
      title: 'Вход',
      resetStep: 'verify',
      resetEmail: email,
      error: 'Неверный или просроченный код. Запросите новый.',
      redirect: redirect || '/',
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.passwordReset.deleteMany({ where: { userId: user.id } }),
  ]);

  res.redirect('/login?flash=Пароль успешно изменён. Войдите с новым паролем');
}
