import { Router } from 'express';
import { ScheduledPaymentsController } from './scheduled-payments.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

const createScheduledSchema = z.object({
  recipientName: z.string().min(2),
  recipientAccount: z.string().min(3),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

router.use(authenticate);

router.post('/', validate({ body: createScheduledSchema }), ScheduledPaymentsController.create);
router.get('/', ScheduledPaymentsController.getAll);
router.delete('/:id', ScheduledPaymentsController.cancel);

export default router;
