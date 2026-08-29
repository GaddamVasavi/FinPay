import { Response, NextFunction } from 'express';
import { DisputesService } from './disputes.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class DisputesController {
  static async createDispute(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DisputesService.createDispute(req.user!.userId, req.body, req);
      return ApiResponse.success(res, 'Dispute filed successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getUserDisputes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DisputesService.getUserDisputes(req.user!.userId);
      return ApiResponse.success(res, 'Disputes retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async getAllDisputes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await DisputesService.getAllDisputes();
      return ApiResponse.success(res, 'All disputes retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async resolveDispute(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await DisputesService.resolveDispute(req.user!.userId, id, req.body, req);
      return ApiResponse.success(res, 'Dispute updated', result);
    } catch (error) {
      next(error);
    }
  }
}
