import { updateUserStatusSchema } from '../admin.validation';

describe('Admin Governance & Role Validations', () => {
  describe('User Status Update Schema', () => {
    it('should validate status change to SUSPENDED', () => {
      const payload = {
        status: 'SUSPENDED' as const,
        reason: 'Suspicious velocity triggered by risk alert',
      };
      const result = updateUserStatusSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should validate status change to ACTIVE', () => {
      const payload = {
        status: 'ACTIVE' as const,
      };
      const result = updateUserStatusSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject unknown status', () => {
      const payload = {
        status: 'BANNED_FOREVER',
      };
      const result = updateUserStatusSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
