import { Router } from 'express';
import { SavingsController } from './savings.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

const createGoalSchema = z.object({
  name: z.string().min(2),
  targetAmount: z.number().positive(),
  targetDate: z.string(),
  currency: z.string().default('USD'),
  color: z.string().optional(),
});

const contributeSchema = z.object({
  amount: z.number().positive(),
  note: z.string().optional(),
});

router.use(authenticate);

router.post('/', validate({ body: createGoalSchema }), SavingsController.createGoal);
router.get('/', SavingsController.getGoals);
router.post('/:id/contribute', validate({ body: contributeSchema }), SavingsController.contribute);
router.post('/:id/withdraw', validate({ body: contributeSchema }), SavingsController.withdraw);

export default router;
