import { Response, NextFunction } from 'express';
import { PaymentRequestsService } from './payment-requests.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class PaymentRequestsController {
  static async createRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentRequestsService.createRequest(req.user!.userId, req.body, req);
      return ApiResponse.success(res, 'Payment request created', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async acceptRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await PaymentRequestsService.acceptRequest(req.user!.userId, id, req);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  static async rejectRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await PaymentRequestsService.rejectRequest(req.user!.userId, id, req);
      return ApiResponse.success(res, 'Payment request rejected', result);
    } catch (error) {
      next(error);
    }
  }

  static async getRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentRequestsService.getRequests(req.user!.userId);
      return ApiResponse.success(res, 'Payment requests retrieved', result);
    } catch (error) {
      next(error);
    }
  }
}
