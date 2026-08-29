import { z } from 'zod';

export const createCardSchema = z.object({
  cardType: z.enum(['VIRTUAL', 'PHYSICAL']).default('VIRTUAL'),
  cardBrand: z.enum(['VISA', 'MASTERCARD']).default('VISA'),
  nickname: z.string().max(50).optional(),
  dailyLimit: z.number().positive().max(100000).default(5000),
  monthlyLimit: z.number().positive().max(500000).default(20000),
});

export const updateCardLimitsSchema = z.object({
  dailyLimit: z.number().positive().max(100000).optional(),
  monthlyLimit: z.number().positive().max(500000).optional(),
  nickname: z.string().max(50).optional(),
});

export const simulateCardTxSchema = z.object({
  merchantName: z.string().min(2),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
});
