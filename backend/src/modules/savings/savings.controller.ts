import { Response, NextFunction } from 'express';
import { SavingsService } from './savings.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class SavingsController {
  static async createGoal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await SavingsService.createGoal(req.user!.userId, req.body, req);
      return ApiResponse.success(res, 'Savings goal created', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getGoals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await SavingsService.getGoals(req.user!.userId);
      return ApiResponse.success(res, 'Savings goals retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async contribute(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await SavingsService.contribute(req.user!.userId, id, req.body, req);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  static async withdraw(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await SavingsService.withdraw(req.user!.userId, id, req.body, req);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }
}
