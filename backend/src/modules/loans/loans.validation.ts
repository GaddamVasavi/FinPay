import { z } from 'zod';

export const applyLoanSchema = z.object({
  principalAmount: z.number().positive().min(500, 'Minimum loan is $500').max(50000, 'Maximum personal loan is $50,000'),
  termMonths: z.number().int().min(3).max(60),
  purpose: z.string().min(5, 'Please provide purpose for loan application'),
  annualIncome: z.number().positive('Annual income is required for assessment'),
  employmentStatus: z.enum(['EMPLOYED', 'SELF_EMPLOYED', 'BUSINESS', 'STUDENT', 'OTHER']),
});

export const reviewLoanSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  adminNotes: z.string().optional(),
});

export const repayInstallmentSchema = z.object({
  installmentId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['WALLET', 'BANK']).default('WALLET'),
});
