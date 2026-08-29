import { Response, NextFunction } from 'express';
import { KYCService } from './kyc.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class KYCController {
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await KYCService.getProfile(req.user!.userId);
      return ApiResponse.success(res, 'KYC profile retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async submitKYC(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await KYCService.submitKYC(req.user!.userId, req.body, req);
      return ApiResponse.success(res, result.message, result.profile);
    } catch (error) {
      next(error);
    }
  }

  static async reviewKYC(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await KYCService.reviewKYC(req.user!.userId, id, req.body, req);
      return ApiResponse.success(res, 'KYC decision recorded successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async getPendingSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await KYCService.getPendingSubmissions();
      return ApiResponse.success(res, 'Pending KYC submissions retrieved', result);
    } catch (error) {
      next(error);
    }
  }
}
