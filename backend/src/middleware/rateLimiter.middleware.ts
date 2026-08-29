import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/response';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    ApiResponse.error(
      res,
      'Too many requests from this IP, please try again later.',
      'RATE_LIMIT_EXCEEDED',
      429
    );
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    ApiResponse.error(
      res,
      'Too many authentication attempts. Please try again after 15 minutes.',
      'AUTH_RATE_LIMIT_EXCEEDED',
      429
    );
  },
});

export const financialOpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 operations per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    ApiResponse.error(
      res,
      'Transaction submission rate limit reached. Please wait a moment before trying again.',
      'TRANSACTION_RATE_LIMIT',
      429
    );
  },
});
