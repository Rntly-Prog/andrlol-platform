import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hasPremiumAccess } from '../utils/jwt';
import { getParamId } from '../utils/params';

/** GET /api/articles — публичный список */
export async function listArticlesApi(_req: Request, res: Response): Promise<void> {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      preview: true,
      category: true,
      isPremium: true,
      createdAt: true,
    },
  });
  res.json(articles);
}

/** GET /api/articles/:id — с проверкой премиум-доступа */
export async function getArticleApi(req: Request, res: Response): Promise<void> {
  const article = await prisma.article.findUnique({ where: { id: getParamId(req) } });
  if (!article) {
    res.status(404).json({ error: 'Статья не найдена' });
    return;
  }

  if (article.isPremium && (!req.user || !hasPremiumAccess(req.user.role))) {
    res.status(403).json({ error: 'Требуется премиум-подписка для просмотра этой статьи' });
    return;
  }

  res.json(article);
}

/** Web: список статей */
export async function listArticlesPage(req: Request, res: Response): Promise<void> {
  const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
  const canReadPremium = req.user ? hasPremiumAccess(req.user.role) : false;

  res.render('pages/articles/list', {
    title: 'Статьи',
    articles,
    canReadPremium,
  });
}

/** Web: просмотр статьи */
export async function showArticlePage(req: Request, res: Response): Promise<void> {
  const article = await prisma.article.findUnique({ where: { id: getParamId(req) } });
  if (!article) {
    res.status(404).render('pages/error', {
      title: 'Не найдено',
      message: 'Статья не найдена',
      statusCode: 404,
    });
    return;
  }

  const canReadPremium = req.user ? hasPremiumAccess(req.user.role) : false;

  if (article.isPremium && !canReadPremium) {
    res.status(403).render('pages/error', {
      title: 'Премиум-контент',
      message: 'Эта статья доступна только премиум-пользователям. Оформите подписку в личном кабинете.',
      statusCode: 403,
    });
    return;
  }

  res.render('pages/articles/show', {
    title: article.title,
    article,
  });
}

/** Web: премиум-раздел */
export async function premiumSection(_req: Request, res: Response): Promise<void> {
  const articles = await prisma.article.findMany({
    where: { isPremium: true },
    orderBy: { createdAt: 'desc' },
  });

  const categoryMap = new Map<string, typeof articles>();
  for (const article of articles) {
    const list = categoryMap.get(article.category) || [];
    list.push(article);
    categoryMap.set(article.category, list);
  }

  const categories = Array.from(categoryMap.entries()).map(([name, items]) => ({
    name,
    articles: items,
  }));

  res.render('pages/premium', {
    title: 'Премиум-раздел',
    categories,
    totalCount: articles.length,
  });
}
