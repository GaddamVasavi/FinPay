import { Response, NextFunction } from 'express';
import { ScheduledPaymentsService } from './scheduled-payments.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class ScheduledPaymentsController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ScheduledPaymentsService.create(req.user!.userId, req.body, req);
      return ApiResponse.success(res, 'Scheduled payment created successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ScheduledPaymentsService.getAll(req.user!.userId);
      return ApiResponse.success(res, 'Scheduled payments retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ScheduledPaymentsService.cancel(req.user!.userId, id, req);
      return ApiResponse.success(res, result.message, result.scheduledPayment);
    } catch (error) {
      next(error);
    }
  }
}
