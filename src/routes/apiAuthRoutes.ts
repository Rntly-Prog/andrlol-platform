import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { registerValidation, loginValidation } from '../validators';

const router = Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);

export default router;
