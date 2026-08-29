import { Response, NextFunction } from 'express';
import { BudgetingService } from './budgeting.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class BudgetingController {
  static async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await BudgetingService.getCategories();
      return ApiResponse.success(res, 'Categories retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async addExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await BudgetingService.addExpense(req.user!.userId, req.body, req);
      return ApiResponse.success(res, 'Expense recorded', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const month = req.query.month ? Number(req.query.month) : undefined;
      const year = req.query.year ? Number(req.query.year) : undefined;
      const result = await BudgetingService.getExpenses(req.user!.userId, month, year);
      return ApiResponse.success(res, 'Expenses retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async addIncome(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await BudgetingService.addIncome(req.user!.userId, req.body, req);
      return ApiResponse.success(res, 'Income recorded', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getIncomes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await BudgetingService.getIncomes(req.user!.userId);
      return ApiResponse.success(res, 'Incomes retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async setBudget(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await BudgetingService.setBudget(req.user!.userId, req.body, req);
      return ApiResponse.success(res, 'Budget updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async getBudget(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const month = Number(req.params.month);
      const year = Number(req.params.year);
      const result = await BudgetingService.getBudget(req.user!.userId, month, year);
      return ApiResponse.success(res, 'Budget retrieved', result);
    } catch (error) {
      next(error);
    }
  }
}
