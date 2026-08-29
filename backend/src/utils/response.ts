import { Response } from 'express';

export interface ApiResponsePayload<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  } | null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ApiResponse {
  static success<T>(
    res: Response,
    message: string = 'Operation successful',
    data: T = {} as T,
    statusCode: number = 200,
    meta?: ApiResponsePayload['meta']
  ) {
    const payload: ApiResponsePayload<T> = {
      success: true,
      message,
      data,
      meta,
    };
    return res.status(statusCode).json(payload);
  }

  static error(
    res: Response,
    message: string = 'Operation failed',
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    details: any = null
  ) {
    const payload: ApiResponsePayload = {
      success: false,
      message,
      data: null,
      error: {
        code,
        details,
      },
    };
    return res.status(statusCode).json(payload);
  }
}

export class ApiError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details: any;

  constructor(message: string, statusCode: number = 400, errorCode: string = 'BAD_REQUEST', details: any = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
