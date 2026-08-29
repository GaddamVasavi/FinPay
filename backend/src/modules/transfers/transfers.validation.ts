import { z } from 'zod';

export const sendTransferSchema = z.object({
  recipientEmail: z.string().email('Valid recipient email is required'),
  amount: z.number().positive('Transfer amount must be positive').max(50000, 'Transfer exceeds single limit of $50,000'),
  currency: z.string().min(3).max(3).default('USD'),
  note: z.string().max(255).optional(),
  idempotencyKey: z.string().min(8, 'Idempotency key required'),
  saveBeneficiary: z.boolean().optional().default(false),
});

export const transferEstimateSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  recipientEmail: z.string().email().optional(),
});
