import { randomUUID } from 'crypto';
import { env } from '../config/env';
import { PREMIUM } from '../constants/premium';

interface YooKassaAmount {
  value: string;
  currency: string;
}

interface YooKassaConfirmation {
  type: string;
  confirmation_url?: string;
  return_url?: string;
}

export interface YooKassaPayment {
  id: string;
  status: string;
  paid: boolean;
  amount: YooKassaAmount;
  confirmation?: YooKassaConfirmation;
  metadata?: Record<string, string>;
}

/** Базовый запрос к API ЮKassa */
async function yookassaRequest<T>(
  method: string,
  path: string,
  body?: object,
  idempotenceKey?: string
): Promise<T> {
  const auth = Buffer.from(`${env.yukassaShopId}:${env.yukassaSecretKey}`).toString('base64');

  const headers: Record<string, string> = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
  };

  if (idempotenceKey) {
    headers['Idempotence-Key'] = idempotenceKey;
  }

  const response = await fetch(`https://api.yookassa.ru/v3${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    const message = (data as { description?: string }).description || 'Ошибка ЮKassa';
    throw new Error(message);
  }

  return data as T;
}

/** Создать платёж на премиум-подписку */
export async function createPremiumPayment(userId: string, _email: string): Promise<YooKassaPayment> {
  return yookassaRequest<YooKassaPayment>(
    'POST',
    '/payments',
    {
      amount: {
        value: PREMIUM.price.toFixed(2),
        currency: PREMIUM.currency,
      },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: `${env.appUrl}/payments/success`,
      },
      description: PREMIUM.description,
      metadata: { userId },
    },
    randomUUID()
  );
}

/** Получить статус платежа */
export async function getPayment(paymentId: string): Promise<YooKassaPayment> {
  return yookassaRequest<YooKassaPayment>('GET', `/payments/${paymentId}`);
}
