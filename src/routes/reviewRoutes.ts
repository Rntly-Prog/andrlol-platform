import { Router } from 'express';
import { submitReview, deleteOwnReview } from '../controllers/reviewController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { reviewValidation } from '../validators';

const router = Router();

router.post('/', authMiddleware, validate(reviewValidation), submitReview);
router.post('/delete', authMiddleware, deleteOwnReview);

export default router;
