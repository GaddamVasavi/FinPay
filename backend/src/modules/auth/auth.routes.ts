import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rateLimiter.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from './auth.validation';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  AuthController.register
);

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  AuthController.login
);

router.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  AuthController.refreshToken
);

router.post('/logout', authenticate, AuthController.logout);

router.get('/me', authenticate, AuthController.getMe);

export default router;
