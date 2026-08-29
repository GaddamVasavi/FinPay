import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ApiError } from '../utils/response';

export type Role = 'CUSTOMER' | 'ADMIN' | 'SUPPORT_AGENT';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(
          `Forbidden: Access requires one of the following roles: [${allowedRoles.join(', ')}]`,
          403,
          'FORBIDDEN'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAdmin = requireRole('ADMIN');
export const requireSupport = requireRole('SUPPORT_AGENT', 'ADMIN');
export const requireCustomer = requireRole('CUSTOMER');
