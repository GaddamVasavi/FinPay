import { z } from 'zod';

export const createBeneficiarySchema = z.object({
  name: z.string().min(2, 'Beneficiary name is required'),
  email: z.string().email('Valid recipient email address is required').optional(),
  accountNumberMasked: z.string().optional(),
  routingNumber: z.string().optional(),
  bankName: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const updateBeneficiarySchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  isDefault: z.boolean().optional(),
});
