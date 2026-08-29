import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { financialOpLimiter } from '../../middleware/rateLimiter.middleware';
import { createPaymentSchema, refundPaymentSchema } from './payments.validation';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  financialOpLimiter,
  validate({ body: createPaymentSchema }),
  PaymentsController.processPayment
);
router.post(
  '/refund',
  financialOpLimiter,
  validate({ body: refundPaymentSchema }),
  PaymentsController.refundPayment
);
router.get('/', PaymentsController.getPayments);

export default router;
