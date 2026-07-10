import { Router } from 'express';
import {
  adminDashboard,
  adminArticlesPage,
  adminGamesPage,
  adminUsersPage,
  adminAuthorPage,
  adminListArticles,
  adminCreateArticle,
  adminUpdateArticle,
  adminDeleteArticle,
  adminListGames,
  adminCreateGame,
  adminUpdateGame,
  adminDeleteGame,
  adminUpdateUserRole,
  adminUpdateUser,
  adminDeleteUser,
  handleCreateArticleWeb,
  handleUpdateArticleWeb,
  handleDeleteArticleWeb,
  handleCreateGameWeb,
  handleUpdateGameWeb,
  handleDeleteGameWeb,
  handleUpdateUserRoleWeb,
  handleUpdateUserWeb,
  handleDeleteUserWeb,
  handleUpdateAuthorWeb,
} from '../controllers/adminController';
import { adminMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { articleValidation, gameValidation, gameUpdateValidation, roleValidation, userUpdateValidation } from '../validators';
import { gameImageUpload, authorPhotoUpload } from '../middleware/upload';

const router = Router();

// Все маршруты админки требуют роль admin
router.use(adminMiddleware);

// Web pages
router.get('/', adminDashboard);
router.get('/articles', adminArticlesPage);
router.get('/games', adminGamesPage);
router.get('/author', adminAuthorPage);
router.get('/users', adminUsersPage);

// Web form handlers
router.post('/articles', validate(articleValidation), handleCreateArticleWeb);
router.post('/articles/:id', validate(articleValidation), handleUpdateArticleWeb);
router.post('/articles/:id/delete', handleDeleteArticleWeb);
router.post('/games', gameImageUpload.single('image'), validate(gameValidation), handleCreateGameWeb);
router.post('/games/:id', gameImageUpload.single('image'), validate(gameUpdateValidation), handleUpdateGameWeb);
router.post('/games/:id/delete', handleDeleteGameWeb);
router.post('/users/:id', validate(userUpdateValidation), handleUpdateUserWeb);
router.post('/users/:id/role', validate(roleValidation), handleUpdateUserRoleWeb);
router.post('/users/:id/delete', handleDeleteUserWeb);
router.post('/author', authorPhotoUpload.single('photo'), handleUpdateAuthorWeb);

export default router;

// REST API admin routes
export const adminApiRouter = Router();
adminApiRouter.use(adminMiddleware);

// Articles CRUD
adminApiRouter.get('/articles', adminListArticles);
adminApiRouter.post('/articles', validate(articleValidation), adminCreateArticle);
adminApiRouter.put('/articles/:id', validate(articleValidation), adminUpdateArticle);
adminApiRouter.delete('/articles/:id', adminDeleteArticle);

// Games CRUD
adminApiRouter.get('/games', adminListGames);
adminApiRouter.post('/games', gameImageUpload.single('image'), validate(gameValidation), adminCreateGame);
adminApiRouter.put('/games/:id', gameImageUpload.single('image'), validate(gameUpdateValidation), adminUpdateGame);
adminApiRouter.delete('/games/:id', adminDeleteGame);

// Users
adminApiRouter.put('/users/:id', validate(userUpdateValidation), adminUpdateUser);
adminApiRouter.put('/users/:id/role', validate(roleValidation), adminUpdateUserRole);
adminApiRouter.delete('/users/:id', adminDeleteUser);
