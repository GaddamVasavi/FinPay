import { z } from 'zod';

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'LOCKED', 'PENDING']),
  reason: z.string().min(3).optional(),
});

export const updateRoleSchema = z.object({
  roleName: z.enum(['CUSTOMER', 'SUPPORT', 'ADMIN', 'COMPLIANCE']),
});
