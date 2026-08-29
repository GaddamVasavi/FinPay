import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { config } from '../config';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  // Handle custom ApiError
  if (err instanceof ApiError) {
    logger.warn(`API Error [${err.statusCode}] ${err.errorCode}: ${err.message}`, {
      path: req.originalUrl,
      method: req.method,
      details: err.details,
    });
    return ApiResponse.error(
      res,
      err.message,
      err.errorCode,
      err.statusCode,
      err.details
    );
  }

  // Handle Prisma Known Request Errors
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    logger.error('Database Query Error:', { code: err.code, meta: err.meta, message: err.message });
    if (err.code === 'P2002') {
      const target = err.meta?.target || 'field';
      return ApiResponse.error(
        res,
        `A unique constraint violation occurred on: ${Array.isArray(target) ? target.join(', ') : target}`,
        'CONFLICT_ERROR',
        409
      );
    }
    if (err.code === 'P2025') {
      return ApiResponse.error(res, 'Record not found in database', 'NOT_FOUND', 404);
    }
  }

  // Handle generic uncaught exceptions
  logger.error('Unhandled Internal Server Error:', err);
  const message = config.env === 'production' ? 'An unexpected server error occurred' : err.message;
  return ApiResponse.error(
    res,
    message,
    'INTERNAL_SERVER_ERROR',
    500,
    config.env === 'development' ? err.stack : undefined
  );
};
