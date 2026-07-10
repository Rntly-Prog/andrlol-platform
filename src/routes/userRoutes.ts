import { Router } from 'express';
import { home, about, profile } from '../controllers/userController';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, home);
router.get('/about', about);
router.get('/profile', authMiddleware, profile);

export default router;
