import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { UserRole } from '../types';
import { roleLabel } from '../utils/jwt';
import { getParamId } from '../utils/params';
import { deleteGameImage, gameImageUrl, authorPhotoUrl, deleteAuthorPhoto } from '../middleware/upload';
import { authorFromForm, getAuthorData, saveAuthorData } from '../services/author';

// ─── Admin Web Pages ───────────────────────────────────────────

export async function adminDashboard(_req: Request, res: Response): Promise<void> {
  const [usersCount, articlesCount, gamesCount] = await Promise.all([
    prisma.user.count(),
    prisma.article.count(),
    prisma.game.count(),
  ]);

  res.render('pages/admin/dashboard', {
    title: 'Админ-панель',
    stats: { usersCount, articlesCount, gamesCount },
  });
}

export async function adminArticlesPage(_req: Request, res: Response): Promise<void> {
  const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
  res.render('pages/admin/articles', { title: 'Управление статьями', articles });
}

export async function adminGamesPage(_req: Request, res: Response): Promise<void> {
  const games = await prisma.game.findMany({ orderBy: { createdAt: 'desc' } });
  res.render('pages/admin/games', { title: 'Управление играми', games });
}

export async function adminUsersPage(req: Request, res: Response): Promise<void> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  res.render('pages/admin/users', {
    title: 'Управление пользователями',
    users,
    roleLabel,
    currentUserId: req.user!.id,
  });
}

export async function adminAuthorPage(_req: Request, res: Response): Promise<void> {
  const author = await getAuthorData();
  res.render('pages/admin/author', { title: 'Профиль автора', author });
}

// ─── Articles CRUD API ─────────────────────────────────────────

export async function adminListArticles(_req: Request, res: Response): Promise<void> {
  const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(articles);
}

export async function adminCreateArticle(req: Request, res: Response): Promise<void> {
  const article = await prisma.article.create({ data: req.body });
  res.status(201).json(article);
}

export async function adminUpdateArticle(req: Request, res: Response): Promise<void> {
  try {
    const article = await prisma.article.update({
      where: { id: getParamId(req) },
      data: req.body,
    });
    res.json(article);
  } catch {
    res.status(404).json({ error: 'Статья не найдена' });
  }
}

export async function adminDeleteArticle(req: Request, res: Response): Promise<void> {
  try {
    await prisma.article.delete({ where: { id: getParamId(req) } });
    res.json({ message: 'Статья удалена' });
  } catch {
    res.status(404).json({ error: 'Статья не найдена' });
  }
}

// ─── Games CRUD API ────────────────────────────────────────────

export async function adminListGames(_req: Request, res: Response): Promise<void> {
  const games = await prisma.game.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(games);
}

export async function adminCreateGame(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'Выберите изображение игры' });
    return;
  }

  const game = await prisma.game.create({
    data: {
      title: req.body.title,
      imageUrl: gameImageUrl(req.file.filename),
      optimizationTip: req.body.optimizationTip,
    },
  });
  res.status(201).json(game);
}

export async function adminUpdateGame(req: Request, res: Response): Promise<void> {
  try {
    const existing = await prisma.game.findUnique({ where: { id: getParamId(req) } });
    if (!existing) {
      res.status(404).json({ error: 'Игра не найдена' });
      return;
    }

    let imageUrl = existing.imageUrl;
    if (req.file) {
      deleteGameImage(existing.imageUrl);
      imageUrl = gameImageUrl(req.file.filename);
    }

    const game = await prisma.game.update({
      where: { id: existing.id },
      data: {
        title: req.body.title,
        imageUrl,
        optimizationTip: req.body.optimizationTip,
      },
    });
    res.json(game);
  } catch {
    res.status(404).json({ error: 'Игра не найдена' });
  }
}

export async function adminDeleteGame(req: Request, res: Response): Promise<void> {
  try {
    const existing = await prisma.game.findUnique({ where: { id: getParamId(req) } });
    if (!existing) {
      res.status(404).json({ error: 'Игра не найдена' });
      return;
    }

    deleteGameImage(existing.imageUrl);
    await prisma.game.delete({ where: { id: existing.id } });
    res.json({ message: 'Игра удалена' });
  } catch {
    res.status(404).json({ error: 'Игра не найдена' });
  }
}

// ─── Users API ─────────────────────────────────────────────────

export async function adminUpdateUserRole(req: Request, res: Response): Promise<void> {
  const { role } = req.body as { role: UserRole };
  const validRoles: UserRole[] = [Role.user, Role.premium, Role.admin];

  if (!validRoles.includes(role)) {
    res.status(400).json({ error: 'Недопустимая роль' });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id: getParamId(req) },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch {
    res.status(404).json({ error: 'Пользователь не найден' });
  }
}

export async function adminUpdateUser(req: Request, res: Response): Promise<void> {
  const id = getParamId(req);
  const { username, email } = req.body as { username: string; email: string };

  const duplicate = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
      NOT: { id },
    },
  });

  if (duplicate) {
    res.status(409).json({ error: 'Пользователь с таким логином или email уже существует' });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { username, email },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch {
    res.status(404).json({ error: 'Пользователь не найден' });
  }
}

export async function adminDeleteUser(req: Request, res: Response): Promise<void> {
  const id = getParamId(req);

  if (req.user?.id === id) {
    res.status(400).json({ error: 'Нельзя удалить свой аккаунт' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'Пользователь не найден' });
      return;
    }

    if (user.role === Role.admin) {
      const adminCount = await prisma.user.count({ where: { role: Role.admin } });
      if (adminCount <= 1) {
        res.status(400).json({ error: 'Нельзя удалить последнего администратора' });
        return;
      }
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Пользователь удалён' });
  } catch {
    res.status(404).json({ error: 'Пользователь не найден' });
  }
}

// ─── Admin Web Form Handlers ───────────────────────────────────

export async function handleCreateArticleWeb(req: Request, res: Response): Promise<void> {
  await prisma.article.create({
    data: {
      title: req.body.title,
      preview: req.body.preview,
      content: req.body.content,
      category: req.body.category,
      isPremium: req.body.isPremium === 'on' || req.body.isPremium === true,
    },
  });
  res.redirect('/admin/articles?flash=Статья создана');
}

export async function handleUpdateArticleWeb(req: Request, res: Response): Promise<void> {
  await prisma.article.update({
    where: { id: getParamId(req) },
    data: {
      title: req.body.title,
      preview: req.body.preview,
      content: req.body.content,
      category: req.body.category,
      isPremium: req.body.isPremium === 'on' || req.body.isPremium === true,
    },
  });
  res.redirect('/admin/articles?flash=Статья обновлена');
}

export async function handleDeleteArticleWeb(req: Request, res: Response): Promise<void> {
  await prisma.article.delete({ where: { id: getParamId(req) } });
  res.redirect('/admin/articles?flash=Статья удалена');
}

export async function handleCreateGameWeb(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.redirect('/admin/games?flash=Выберите изображение игры');
    return;
  }

  await prisma.game.create({
    data: {
      title: req.body.title,
      imageUrl: gameImageUrl(req.file.filename),
      optimizationTip: req.body.optimizationTip,
    },
  });
  res.redirect('/admin/games?flash=Игра добавлена');
}

export async function handleUpdateGameWeb(req: Request, res: Response): Promise<void> {
  const id = getParamId(req);
  const existing = await prisma.game.findUnique({ where: { id } });

  if (!existing) {
    res.redirect('/admin/games?flash=Игра не найдена');
    return;
  }

  let imageUrl = existing.imageUrl;
  if (req.file) {
    deleteGameImage(existing.imageUrl);
    imageUrl = gameImageUrl(req.file.filename);
  }

  await prisma.game.update({
    where: { id },
    data: {
      title: req.body.title,
      imageUrl,
      optimizationTip: req.body.optimizationTip,
    },
  });
  res.redirect('/admin/games?flash=Игра обновлена');
}

export async function handleDeleteGameWeb(req: Request, res: Response): Promise<void> {
  const id = getParamId(req);
  const existing = await prisma.game.findUnique({ where: { id } });

  if (existing) {
    deleteGameImage(existing.imageUrl);
    await prisma.game.delete({ where: { id } });
  }

  res.redirect('/admin/games?flash=Игра удалена');
}

export async function handleUpdateUserWeb(req: Request, res: Response): Promise<void> {
  const id = getParamId(req);
  const { username, email } = req.body as { username: string; email: string };

  const duplicate = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
      NOT: { id },
    },
  });

  if (duplicate) {
    res.redirect('/admin/users?flash=Пользователь с таким логином или email уже существует');
    return;
  }

  await prisma.user.update({
    where: { id },
    data: { username, email },
  });
  res.redirect('/admin/users?flash=Данные пользователя сохранены');
}

export async function handleUpdateUserRoleWeb(req: Request, res: Response): Promise<void> {
  await prisma.user.update({
    where: { id: getParamId(req) },
    data: { role: req.body.role as Role },
  });
  res.redirect('/admin/users?flash=Роль сохранена');
}

export async function handleDeleteUserWeb(req: Request, res: Response): Promise<void> {
  const id = getParamId(req);

  if (req.user?.id === id) {
    res.redirect('/admin/users?flash=Нельзя удалить свой аккаунт');
    return;
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.redirect('/admin/users?flash=Пользователь не найден');
    return;
  }

  if (user.role === Role.admin) {
    const adminCount = await prisma.user.count({ where: { role: Role.admin } });
    if (adminCount <= 1) {
      res.redirect('/admin/users?flash=Нельзя удалить последнего администратора');
      return;
    }
  }

  await prisma.user.delete({ where: { id } });
  res.redirect('/admin/users?flash=Пользователь удалён');
}

export async function handleUpdateAuthorWeb(req: Request, res: Response): Promise<void> {
  const existing = await getAuthorData();
  const data = authorFromForm(req.body);

  if (req.file) {
    deleteAuthorPhoto(existing.photo);
    data.photo = authorPhotoUrl(req.file.filename);
  } else {
    data.photo = existing.photo;
  }

  await saveAuthorData(data);
  res.redirect('/admin/author?flash=Профиль автора обновлён');
}
