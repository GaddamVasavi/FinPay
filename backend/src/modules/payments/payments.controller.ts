import { Response, NextFunction } from 'express';
import { PaymentsService } from './payments.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class PaymentsController {
  static async processPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentsService.processPayment(req.user!.userId, req.body, req);
      return ApiResponse.success(res, result.message, result, result.isReplay ? 200 : 201);
    } catch (error) {
      next(error);
    }
  }

  static async refundPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentsService.refundPayment(req.user!.userId, req.body, req);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  static async getPayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentsService.getPayments(req.user!.userId);
      return ApiResponse.success(res, 'Payments retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }
}
