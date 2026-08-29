import { Router } from 'express';
import { PaymentRequestsController } from './payment-requests.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { financialOpLimiter } from '../../middleware/rateLimiter.middleware';
import { z } from 'zod';

const router = Router();

const createRequestSchema = z.object({
  payerEmail: z.string().email(),
  amount: z.number().positive().max(50000),
  currency: z.string().default('USD'),
  description: z.string().max(255).optional(),
  expiryDays: z.number().int().positive().max(60).optional(),
});

router.use(authenticate);

router.post('/', financialOpLimiter, validate({ body: createRequestSchema }), PaymentRequestsController.createRequest);
router.get('/', PaymentRequestsController.getRequests);
router.post('/:id/accept', financialOpLimiter, PaymentRequestsController.acceptRequest);
router.post('/:id/reject', PaymentRequestsController.rejectRequest);

export default router;
