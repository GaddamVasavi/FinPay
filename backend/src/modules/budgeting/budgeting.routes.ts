import { Router } from 'express';
import { BudgetingController } from './budgeting.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createExpenseSchema,
  createIncomeSchema,
  createBudgetSchema,
} from './budgeting.validation';

const router = Router();

router.use(authenticate);

router.get('/categories', BudgetingController.getCategories);
router.post('/expenses', validate({ body: createExpenseSchema }), BudgetingController.addExpense);
router.get('/expenses', BudgetingController.getExpenses);

router.post('/income', validate({ body: createIncomeSchema }), BudgetingController.addIncome);
router.get('/income', BudgetingController.getIncomes);

router.post('/budget', validate({ body: createBudgetSchema }), BudgetingController.setBudget);
router.get('/budget/:year/:month', BudgetingController.getBudget);

export default router;
