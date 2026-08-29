import { Router } from 'express';
import { TransfersController } from './transfers.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { financialOpLimiter } from '../../middleware/rateLimiter.middleware';
import { sendTransferSchema } from './transfers.validation';

const router = Router();

router.use(authenticate);

router.post(
  '/send',
  financialOpLimiter,
  validate({ body: sendTransferSchema }),
  TransfersController.sendTransfer
);
router.get('/history', TransfersController.getHistory);
router.get('/receipt/:ref', TransfersController.getReceipt);

export default router;
