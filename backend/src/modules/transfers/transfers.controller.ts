import { Response, NextFunction } from 'express';
import { TransfersService } from './transfers.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class TransfersController {
  static async sendTransfer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await TransfersService.sendTransfer(req.user!.userId, req.body, req);
      return ApiResponse.success(res, result.message, result, result.isReplay ? 200 : 201);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await TransfersService.getHistory(req.user!.userId);
      return ApiResponse.success(res, 'Transfer history retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async getReceipt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { ref } = req.params;
      const result = await TransfersService.getReceipt(req.user!.userId, ref);
      return ApiResponse.success(res, 'Transfer receipt retrieved', result);
    } catch (error) {
      next(error);
    }
  }
}
