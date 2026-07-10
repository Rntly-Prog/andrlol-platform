import { Router } from 'express';
import {
  premiumLandingPage,
  premiumCheckoutPage,
  createPaymentWeb,
  createPaymentApi,
  paymentSuccessPage,
  yookassaWebhook,
  demoPaymentWeb,
} from '../controllers/paymentController';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, premiumLandingPage);
router.get('/checkout', authMiddleware, premiumCheckoutPage);
router.post('/create', authMiddleware, createPaymentWeb);
router.get('/success', authMiddleware, paymentSuccessPage);
router.post('/demo', authMiddleware, demoPaymentWeb);

export default router;

export const paymentApiRouter = Router();
paymentApiRouter.post('/create', authMiddleware, createPaymentApi);
paymentApiRouter.post('/webhook', yookassaWebhook);
