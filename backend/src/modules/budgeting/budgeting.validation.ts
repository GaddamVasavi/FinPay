import { z } from 'zod';

export const createExpenseSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  date: z.string(),
  description: z.string().min(2),
  isRecurring: z.boolean().optional().default(false),
});

export const createIncomeSchema = z.object({
  source: z.string().min(2),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  date: z.string(),
  category: z.string().default('Salary'),
  isRecurring: z.boolean().optional().default(false),
  description: z.string().optional(),
});

export const createBudgetSchema = z.object({
  name: z.string().min(2),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2024).max(2050),
  categories: z.array(
    z.object({
      categoryId: z.string().uuid(),
      limit: z.number().positive(),
    })
  ),
});
