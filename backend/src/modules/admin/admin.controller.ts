import { Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class AdminController {
  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getPlatformStats();
      return ApiResponse.success(res, 'Platform statistics retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search, status } = req.query as any;
      const result = await AdminService.getUsers({ search, status });
      return ApiResponse.success(res, 'Users retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await AdminService.updateUserStatus(req.user!.userId, id, req.body, req);
      return ApiResponse.success(res, 'User status updated', result);
    } catch (error) {
      next(error);
    }
  }

  static async getRiskAlerts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getRiskAlerts();
      return ApiResponse.success(res, 'Risk alerts retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async reviewRiskAlert(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await AdminService.reviewRiskAlert(req.user!.userId, id, req.body, req);
      return ApiResponse.success(res, 'Risk alert updated', result);
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getAuditLogs();
      return ApiResponse.success(res, 'Audit logs retrieved', result);
    } catch (error) {
      next(error);
    }
  }
}
