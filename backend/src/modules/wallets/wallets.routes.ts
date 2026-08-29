import { Router } from 'express';
import { WalletsController } from './wallets.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { financialOpLimiter } from '../../middleware/rateLimiter.middleware';
import {
  addFundsSchema,
  withdrawFundsSchema,
  getTransactionsQuerySchema,
  generateStatementSchema,
} from './wallets.validation';

const router = Router();

router.use(authenticate);

router.get('/overview', WalletsController.getOverview);
router.post(
  '/add-funds',
  financialOpLimiter,
  validate({ body: addFundsSchema }),
  WalletsController.addFunds
);
router.post(
  '/withdraw',
  financialOpLimiter,
  validate({ body: withdrawFundsSchema }),
  WalletsController.withdrawFunds
);
router.get(
  '/transactions',
  validate({ query: getTransactionsQuerySchema }),
  WalletsController.getTransactions
);
router.post(
  '/statement',
  validate({ body: generateStatementSchema }),
  WalletsController.generateStatement
);

export default router;
