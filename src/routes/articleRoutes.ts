import { Router } from 'express';
import {
  listArticlesApi,
  getArticleApi,
  listArticlesPage,
  showArticlePage,
  premiumSection,
} from '../controllers/articleController';
import { authMiddleware, premiumMiddleware, optionalAuth } from '../middleware/auth';

const router = Router();

// REST API
router.get('/', listArticlesApi);
router.get('/:id', authMiddleware, getArticleApi);

export default router;

// Web routes (отдельный экспорт)
export const webArticleRouter = Router();
webArticleRouter.get('/', optionalAuth, listArticlesPage);
webArticleRouter.get('/premium', authMiddleware, premiumMiddleware, premiumSection);
webArticleRouter.get('/:id', optionalAuth, showArticlePage);
