import { WalletsService } from '../wallets.service';
import { Money } from '../../../utils/decimal';

describe('Wallets & Decimal Financial Accounting Tests', () => {
  describe('Balance Deductions & Arithmetic Precision', () => {
    it('should compute exact decimal balances after series of deposits and withdrawals', () => {
      let balance = Money.parse('1000.5000');
      const deposit = Money.parse('450.2500');
      balance = Money.add(balance, deposit);
      expect(balance.toString()).toBe('1450.75');
      expect(Money.toDbString(balance)).toBe('1450.7500');

      const withdrawal = Money.parse('120.3333');
      balance = Money.subtract(balance, withdrawal);
      expect(Money.toDbString(balance)).toBe('1330.4167');
    });

    it('should correctly reject withdrawal if amount exceeds balance', () => {
      const available = Money.parse('250.0000');
      const requested = Money.parse('250.0100');
      expect(Money.isGreaterThanOrEqualTo(available, requested)).toBe(false);
    });

    it('should format money with standard currency symbol and 2 decimals', () => {
      const amount = '12500.4567';
      const formatted = Money.formatDisplay(amount, 'USD');
      expect(formatted).toBe('$12,500.46');
    });
  });
});
