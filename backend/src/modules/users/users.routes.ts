import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { changePasswordSchema } from '../auth/auth.validation';
import { z } from 'zod';

const router = Router();

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phoneNumber: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  dateOfBirth: z.string().optional(),
});

const updateAddressSchema = z.object({
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(2),
  country: z.string().min(2),
});

router.use(authenticate);

router.put('/profile', validate({ body: updateProfileSchema }), UsersController.updateProfile);
router.put('/address', validate({ body: updateAddressSchema }), UsersController.updateAddress);
router.post('/change-password', validate({ body: changePasswordSchema }), UsersController.changePassword);

export default router;
