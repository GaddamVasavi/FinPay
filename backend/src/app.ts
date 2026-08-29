import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { errorHandler } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimiter.middleware';
import { swaggerDocument } from './docs/swagger';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import walletsRoutes from './modules/wallets/wallets.routes';
import bankAccountsRoutes from './modules/bank-accounts/bank-accounts.routes';
import kycRoutes from './modules/kyc/kyc.routes';
import beneficiariesRoutes from './modules/beneficiaries/beneficiaries.routes';
import { ApiResponse } from './utils/response';

export const createApp = (): Express => {
  const app = express();

  // Security Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: [config.frontendUrl, 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    })
  );

  // Request Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Request Logging
  if (config.env !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate Limiting
  app.use('/api', generalLimiter);

  // API Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Health Check
  app.get('/health', (req: Request, res: Response) => {
    return ApiResponse.success(res, 'FinPay API Server is operational', {
      status: 'UP',
      timestamp: new Date().toISOString(),
      environment: config.env,
    });
  });

  // Base API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/wallets', walletsRoutes);
  app.use('/api/bank-accounts', bankAccountsRoutes);
  app.use('/api/kyc', kycRoutes);
  app.use('/api/beneficiaries', beneficiariesRoutes);

  // 404 Route Handler
  app.use('*', (req: Request, res: Response) => {
    return ApiResponse.error(
      res,
      `API endpoint ${req.method} ${req.originalUrl} not found`,
      'ENDPOINT_NOT_FOUND',
      404
    );
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
