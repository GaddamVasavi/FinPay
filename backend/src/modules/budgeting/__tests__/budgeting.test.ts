import { createExpenseSchema, createIncomeSchema, createBudgetSchema } from '../budgeting.validation';
import { Money } from '../../../utils/decimal';

describe('Budgeting, Expense & Income Validations', () => {
  describe('Expense Validation', () => {
    it('should validate standard personal expense', () => {
      const expense = {
        categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        amount: 85.5,
        currency: 'USD',
        date: new Date().toISOString(),
        description: 'Supermarket weekly groceries',
        isRecurring: false,
      };

      const result = createExpenseSchema.safeParse(expense);
      expect(result.success).toBe(true);
    });

    it('should reject non-positive expense amounts', () => {
      const invalid = {
        categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        amount: 0,
        date: new Date().toISOString(),
        description: 'Invalid',
      };
      const result = createExpenseSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Income Validation', () => {
    it('should validate incoming salary item', () => {
      const income = {
        source: 'Acme Corp',
        amount: 4500,
        currency: 'USD',
        date: new Date().toISOString(),
        category: 'Salary',
        isRecurring: true,
      };
      const result = createIncomeSchema.safeParse(income);
      expect(result.success).toBe(true);
    });
  });
});
