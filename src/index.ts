import path from 'path';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { optionalAuth } from './middleware/auth';
import { localsMiddleware } from './middleware/locals';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import apiAuthRoutes from './routes/apiAuthRoutes';
import authRoutes from './routes/authRoutes';
import articleRoutes, { webArticleRouter } from './routes/articleRoutes';
import gameRoutes from './routes/gameRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes, { adminApiRouter } from './routes/adminRoutes';
import paymentRoutes, { paymentApiRouter } from './routes/paymentRoutes';
import reviewRoutes from './routes/reviewRoutes';

const app = express();

if (!env.isDev) {
  app.set('trust proxy', 1);
}

// Пути к шаблонам и статике (относительно корня проекта)
const rootDir = path.join(__dirname, '..');

app.set('view engine', 'ejs');
app.set('views', path.join(rootDir, 'views'));

// Middleware
app.use(morgan(env.isDev ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(rootDir, 'public')));
app.use(optionalAuth);
app.use(localsMiddleware);

// REST API
app.use('/api/auth', apiAuthRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/payments', paymentApiRouter);
app.use('/api/admin', adminApiRouter);

// Web pages
app.use('/', userRoutes);
app.use('/articles', webArticleRouter);
app.use('/games', gameRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/premium', paymentRoutes);
app.use('/payments', paymentRoutes);
app.use('/reviews', reviewRoutes);

// Обработка ошибок
app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap(): Promise<void> {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${env.port}`);
    console.log(`📚 API: http://localhost:${env.port}/api`);
  });
}

bootstrap().catch((err) => {
  console.error('Не удалось запустить сервер:', err);
  process.exit(1);
});

export default app;
