import { Response, NextFunction } from 'express';
import { WalletsService } from './wallets.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class WalletsController {
  static async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await WalletsService.getWalletOverview(req.user!.userId);
      return ApiResponse.success(res, 'Wallet overview retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async addFunds(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await WalletsService.addFunds(req.user!.userId, req.body, req);
      return ApiResponse.success(res, result.message, result, result.isReplay ? 200 : 201);
    } catch (error) {
      next(error);
    }
  }

  static async withdrawFunds(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await WalletsService.withdrawFunds(req.user!.userId, req.body, req);
      return ApiResponse.success(res, result.message, result, result.isReplay ? 200 : 201);
    } catch (error) {
      next(error);
    }
  }

  static async getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await WalletsService.getTransactions(req.user!.userId, req.query as any);
      return ApiResponse.success(res, 'Transactions retrieved successfully', result.transactions, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async generateStatement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await WalletsService.generateStatement(req.user!.userId, req.body);
      return ApiResponse.success(res, 'Account statement generated successfully', result);
    } catch (error) {
      next(error);
    }
  }
}
