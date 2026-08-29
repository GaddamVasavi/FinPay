import { Money } from '../../../utils/decimal';
import { sendTransferSchema } from '../transfers.validation';
import { createPaymentSchema } from '../../payments/payments.validation';

describe('P2P Transfers & Payment Validations', () => {
  describe('Transfer Payload Validations', () => {
    it('should validate valid transfer request with idempotency key', () => {
      const valid = {
        recipientEmail: 'alex.morgan@finpay.local',
        amount: 250.5,
        currency: 'USD',
        note: 'Freelance payment',
        idempotencyKey: 'TRF-test-idempotency-12345',
        saveBeneficiary: true,
      };

      const result = sendTransferSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject transfer with negative or 0 amount', () => {
      const invalid = {
        recipientEmail: 'alex.morgan@finpay.local',
        amount: -50,
        idempotencyKey: 'TRF-test-idempotency-12345',
      };

      const result = sendTransferSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject transfer without idempotency key', () => {
      const invalid = {
        recipientEmail: 'alex.morgan@finpay.local',
        amount: 100,
        idempotencyKey: 'short',
      };

      const result = sendTransferSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Payment Gateway Validations', () => {
    it('should validate valid merchant payment', () => {
      const payment = {
        merchantName: 'Acme Supermarket',
        merchantCategory: 'GROCERIES',
        amount: 45.99,
        currency: 'USD',
        paymentMethod: 'WALLET',
        idempotencyKey: 'PAY-sample-key-123456',
      };

      const result = createPaymentSchema.safeParse(payment);
      expect(result.success).toBe(true);
    });
  });
});
