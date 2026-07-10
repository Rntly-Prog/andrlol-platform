import nodemailer from 'nodemailer';
import { env } from '../config/env';

function createTransport() {
  if (!env.smtpConfigured) return null;

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
}

export async function sendPasswordResetCode(email: string, code: string): Promise<void> {
  const subject = 'Код восстановления пароля — AndrLol';
  const text = [
    'Вы запросили восстановление пароля на сайте AndrLol.',
    '',
    `Ваш код: ${code}`,
    '',
    'Код действителен 15 минут.',
    'Если вы не запрашивали восстановление — просто проигнорируйте это письмо.',
  ].join('\n');

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#3b82f6">Восстановление пароля</h2>
      <p>Вы запросили восстановление пароля на сайте AndrLol.</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#f97316;text-align:center;padding:16px 0">${code}</p>
      <p style="color:#64748b;font-size:14px">Код действителен 15 минут. Если вы не запрашивали восстановление — проигнорируйте это письмо.</p>
    </div>
  `;

  const transport = createTransport();

  if (!transport) {
    console.log(`[email:dev] Код восстановления для ${email}: ${code}`);
    return;
  }

  await transport.sendMail({
    from: env.smtpFrom,
    to: email,
    subject,
    text,
    html,
  });
}
