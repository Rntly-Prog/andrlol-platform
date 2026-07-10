import { body } from 'express-validator';

export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Имя пользователя: от 3 до 30 символов')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Имя может содержать только буквы, цифры и _'),
  body('email').trim().isEmail().withMessage('Введите корректный email').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен быть не менее 6 символов'),
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Введите корректный email').normalizeEmail(),
  body('password').notEmpty().withMessage('Введите пароль'),
];

export const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Введите корректный email').normalizeEmail(),
];

export const resetPasswordValidation = [
  body('email').trim().isEmail().withMessage('Введите корректный email').normalizeEmail(),
  body('code')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Код должен содержать 6 цифр'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен быть не менее 6 символов'),
  body('passwordConfirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Пароли не совпадают');
      }
      return true;
    }),
];

export const articleValidation = [
  body('title').trim().notEmpty().withMessage('Укажите заголовок').isLength({ max: 200 }),
  body('preview').trim().notEmpty().withMessage('Укажите превью').isLength({ max: 500 }),
  body('content').trim().notEmpty().withMessage('Укажите содержимое'),
  body('category').trim().notEmpty().withMessage('Укажите категорию'),
];

export const gameValidation = [
  body('title').trim().notEmpty().withMessage('Укажите название игры'),
  body('optimizationTip').trim().notEmpty().withMessage('Укажите совет по оптимизации'),
];

export const gameUpdateValidation = [
  body('title').trim().notEmpty().withMessage('Укажите название игры'),
  body('optimizationTip').trim().notEmpty().withMessage('Укажите совет по оптимизации'),
];

export const roleValidation = [
  body('role')
    .isIn(['user', 'premium', 'admin'])
    .withMessage('Роль должна быть: user, premium или admin'),
];

export const userUpdateValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Имя пользователя: от 3 до 30 символов')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Имя может содержать только буквы, цифры и _'),
  body('email').trim().isEmail().withMessage('Введите корректный email').normalizeEmail(),
];

export const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Оценка должна быть от 1 до 5'),
  body('text')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Отзыв: от 10 до 1000 символов'),
];
