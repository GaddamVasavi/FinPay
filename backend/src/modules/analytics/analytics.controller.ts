import { Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class AnalyticsController {
  static async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AnalyticsService.getFinancialAnalytics(req.user!.userId);
      return ApiResponse.success(res, 'Financial analytics retrieved', result);
    } catch (error) {
      next(error);
    }
  }
}
