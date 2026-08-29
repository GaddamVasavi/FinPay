import { PasswordUtil } from '../../../utils/password';
import { JwtUtil } from '../../../utils/jwt';
import { Money } from '../../../utils/decimal';
import { registerSchema, loginSchema } from '../auth.validation';

describe('FinPay Core Security & Utility Tests', () => {
  describe('Password Hashing & Verification', () => {
    it('should hash a password and verify matching hash', async () => {
      const password = 'FintechSecure#2026';
      const hash = await PasswordUtil.hash(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);

      const isValid = await PasswordUtil.compare(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await PasswordUtil.compare('WrongPassword#123', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Token Issuance & Verification', () => {
    it('should generate and verify valid access and refresh tokens', () => {
      const payload = {
        userId: 'usr_test_123456',
        email: 'alex.morgan@finpay.local',
        role: 'CUSTOMER' as const,
      };

      const accessToken = JwtUtil.generateAccessToken(payload);
      expect(accessToken).toBeDefined();

      const decodedAccess = JwtUtil.verifyAccessToken(accessToken);
      expect(decodedAccess.userId).toBe(payload.userId);
      expect(decodedAccess.email).toBe(payload.email);
      expect(decodedAccess.role).toBe(payload.role);

      const refreshToken = JwtUtil.generateRefreshToken(payload);
      const decodedRefresh = JwtUtil.verifyRefreshToken(refreshToken);
      expect(decodedRefresh.userId).toBe(payload.userId);
    });
  });

  describe('Financial Decimal Precision Calculations', () => {
    it('should eliminate floating-point arithmetic errors in monetary additions and subtractions', () => {
      // 0.1 + 0.2 in JS float is 0.30000000000000004
      const a = '0.1000';
      const b = '0.2000';
      const sum = Money.add(a, b);
      expect(sum.toString()).toBe('0.3');
      expect(Money.toDbString(sum)).toBe('0.3000');

      const balance = '100.0000';
      const withdrawal = '45.7550';
      const remainder = Money.subtract(balance, withdrawal);
      expect(remainder.toString()).toBe('54.245');
      expect(Money.toDbString(remainder)).toBe('54.2450');

      expect(Money.isGreaterThanOrEqualTo('100.0000', '99.9999')).toBe(true);
      expect(Money.isGreaterThanOrEqualTo('50.0000', '50.0001')).toBe(false);
    });
  });

  describe('Auth Input Validation Schemas', () => {
    it('should validate valid registration payload', () => {
      const validPayload = {
        email: 'customer@finpay.local',
        password: 'SecurePass#2026',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+12025550100',
        role: 'CUSTOMER',
      };

      const result = registerSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject invalid password without uppercase or digits', () => {
      const invalidPayload = {
        email: 'customer@finpay.local',
        password: 'weakpassword',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = registerSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email in login', () => {
      const invalidLogin = {
        email: 'invalid-email',
        password: 'Password123!',
      };

      const result = loginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });
  });
});
