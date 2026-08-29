import { Router } from 'express';
import { LoansController } from './loans.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { financialOpLimiter } from '../../middleware/rateLimiter.middleware';
import {
  applyLoanSchema,
  reviewLoanSchema,
  repayInstallmentSchema,
} from './loans.validation';

const router = Router();

router.use(authenticate);

router.post('/apply', financialOpLimiter, validate({ body: applyLoanSchema }), LoansController.applyLoan);
router.get('/', LoansController.getLoans);
router.patch('/:id/review', requireAdmin, validate({ body: reviewLoanSchema }), LoansController.reviewLoan);
router.post('/repay', financialOpLimiter, validate({ body: repayInstallmentSchema }), LoansController.repayInstallment);

export default router;
