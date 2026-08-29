import { createCardSchema } from '../cards.validation';
import { applyLoanSchema } from '../../loans/loans.validation';

describe('Cards & Loans Logic & Validations', () => {
  describe('Virtual Card Validation', () => {
    it('should accept valid virtual card parameters', () => {
      const valid = {
        cardType: 'VIRTUAL' as const,
        cardBrand: 'VISA' as const,
        nickname: 'Streaming Services',
        dailyLimit: 3000,
        monthlyLimit: 15000,
      };
      const result = createCardSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid card limits', () => {
      const invalid = {
        dailyLimit: -100,
      };
      const result = createCardSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Loan Amortization & Application Validation', () => {
    it('should validate valid personal loan application', () => {
      const validLoan = {
        principalAmount: 10000,
        termMonths: 24,
        purpose: 'Small Business Equipment',
        annualIncome: 85000,
        employmentStatus: 'EMPLOYED' as const,
      };
      const result = applyLoanSchema.safeParse(validLoan);
      expect(result.success).toBe(true);
    });

    it('should reject loan below minimum $500', () => {
      const invalidLoan = {
        principalAmount: 200,
        termMonths: 12,
        purpose: 'Too small',
        annualIncome: 50000,
        employmentStatus: 'EMPLOYED' as const,
      };
      const result = applyLoanSchema.safeParse(invalidLoan);
      expect(result.success).toBe(false);
    });
  });
});
