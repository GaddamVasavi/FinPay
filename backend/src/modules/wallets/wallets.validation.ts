import { z } from 'zod';

export const addFundsSchema = z.object({
  amount: z.number().positive('Deposit amount must be greater than 0').max(100000, 'Single deposit exceeds maximum limit of $100,000'),
  currency: z.string().min(3).max(3).default('USD'),
  paymentMethod: z.enum(['BANK_TRANSFER', 'DEBIT_CARD', 'SANDBOX_GATEWAY', 'WIRE_TRANSFER']),
  sourceAccountId: z.string().optional(),
  idempotencyKey: z.string().min(8, 'Idempotency key must be provided for safe financial execution'),
  description: z.string().max(255).optional(),
});

export const withdrawFundsSchema = z.object({
  amount: z.number().positive('Withdrawal amount must be greater than 0'),
  currency: z.string().min(3).max(3).default('USD'),
  destinationBankAccountId: z.string().uuid('A valid linked bank account ID is required for withdrawal'),
  idempotencyKey: z.string().min(8, 'Idempotency key required'),
  description: z.string().max(255).optional(),
});

export const updateLimitsSchema = z.object({
  dailyLimit: z.number().positive().max(1000000).optional(),
  monthlyLimit: z.number().positive().max(5000000).optional(),
});

export const getTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'REFUND', 'FEE', 'ADJUSTMENT']).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REVERSED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'amount', 'type', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const generateStatementSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  format: z.enum(['PDF', 'CSV', 'JSON']).default('JSON'),
  currency: z.string().default('USD'),
});
