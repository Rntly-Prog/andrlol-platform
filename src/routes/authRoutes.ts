import { Router } from 'express';
import {
  showRegister,
  showLogin,
  handleRegister,
  handleLogin,
  logout,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController';
import { optionalAuth } from '../middleware/auth';
import { forgotPasswordValidation, resetPasswordValidation } from '../validators';
import { validate, handleAuthValidation } from '../middleware/validation';

const router = Router();

router.get('/register', optionalAuth, showRegister);
router.post('/register', optionalAuth, handleRegister);
router.get('/login', optionalAuth, showLogin);
router.post('/login', optionalAuth, handleLogin);
router.post('/forgot-password', optionalAuth, validate(forgotPasswordValidation, handleAuthValidation), requestPasswordReset);
router.post('/reset-password', optionalAuth, validate(resetPasswordValidation, handleAuthValidation), resetPassword);
router.get('/logout', logout);
router.post('/logout', logout);

export default router;
