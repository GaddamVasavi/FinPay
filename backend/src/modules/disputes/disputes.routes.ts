import { Router } from 'express';
import { DisputesController } from './disputes.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

const createDisputeSchema = z.object({
  transactionId: z.string().uuid(),
  reason: z.string().min(3),
  description: z.string().min(5),
  evidenceUrl: z.string().url().optional(),
});

router.use(authenticate);

router.post('/', validate({ body: createDisputeSchema }), DisputesController.createDispute);
router.get('/my', DisputesController.getUserDisputes);
router.get('/', requireAdmin, DisputesController.getAllDisputes);
router.patch('/:id/resolve', requireAdmin, DisputesController.resolveDispute);

export default router;
