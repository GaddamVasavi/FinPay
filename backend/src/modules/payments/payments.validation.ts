import { z } from 'zod';

export const createPaymentSchema = z.object({
  merchantName: z.string().min(2, 'Merchant name is required'),
  merchantCategory: z.string().optional(),
  amount: z.number().positive('Payment amount must be positive'),
  currency: z.string().default('USD'),
  paymentMethod: z.enum(['WALLET', 'CARD', 'BANK']).default('WALLET'),
  idempotencyKey: z.string().min(8, 'Idempotency key required'),
});

export const refundPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  reason: z.string().min(3, 'Refund reason is required'),
});
