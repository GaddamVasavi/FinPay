import { z } from 'zod';

export const linkBankAccountSchema = z.object({
  bankName: z.string().min(2, 'Bank name is required'),
  accountHolder: z.string().min(2, 'Account holder full name is required'),
  accountNumber: z.string().min(8).max(20, 'Account number must be between 8 and 20 digits'),
  routingNumber: z.string().min(9).max(9, 'Routing number must be exactly 9 digits').optional(),
  currency: z.string().default('USD'),
  isDefault: z.boolean().optional().default(false),
});

export const updateBankAccountSchema = z.object({
  isDefault: z.boolean().optional(),
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'DISABLED']).optional(),
});
