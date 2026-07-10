import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/andrlol_platform',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  yukassaShopId: process.env.YUKASSA_SHOP_ID || '',
  yukassaSecretKey: process.env.YUKASSA_SECRET_KEY || '',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'AndrLol <noreply@andrlol.ru>',
  get yukassaConfigured(): boolean {
    return Boolean(this.yukassaShopId && this.yukassaSecretKey);
  },
  get smtpConfigured(): boolean {
    return Boolean(this.smtpHost && this.smtpUser && this.smtpPass);
  },
};
