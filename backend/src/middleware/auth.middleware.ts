import { Request, Response, NextFunction } from 'express';
import { JwtUtil, TokenPayload } from '../utils/jwt';
import { ApiError } from '../utils/response';
import { prisma } from '../database/prisma';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & {
    firstName?: string;
    lastName?: string;
    isEmailVerified?: boolean;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Authentication token is required', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError('Malformed authorization header', 401, 'UNAUTHORIZED');
    }

    let payload: TokenPayload;
    try {
      payload = JwtUtil.verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError('Access token has expired', 401, 'TOKEN_EXPIRED');
      }
      throw new ApiError('Invalid access token', 401, 'INVALID_TOKEN');
    }

    // Verify user exists and is ACTIVE
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        isEmailVerified: true,
        lockoutUntil: true,
      },
    });

    if (!user) {
      throw new ApiError('User account not found', 401, 'USER_NOT_FOUND');
    }

    if (user.status === 'LOCKED' || (user.lockoutUntil && user.lockoutUntil > new Date())) {
      throw new ApiError('User account is temporarily locked due to security policy', 403, 'ACCOUNT_LOCKED');
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw new ApiError('User account is suspended or inactive', 403, 'ACCOUNT_INACTIVE');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
    };

    next();
  } catch (error) {
    next(error);
  }
};
