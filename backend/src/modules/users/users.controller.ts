import { Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { ApiResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class UsersController {
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await UsersService.updateProfile(req.user!.userId, req.body, req);
      return ApiResponse.success(res, 'Profile updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async updateAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await UsersService.updateAddress(req.user!.userId, req.body, req);
      return ApiResponse.success(res, 'Address updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await UsersService.changePassword(
        req.user!.userId,
        currentPassword,
        newPassword,
        req
      );
      return ApiResponse.success(res, result.message);
    } catch (error) {
      next(error);
    }
  }
}
