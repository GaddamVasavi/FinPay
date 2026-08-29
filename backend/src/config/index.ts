import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from project root .env or backend .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/finpay_db?schema=public',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'finpay_dev_secret_key_change_in_production_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'finpay_dev_refresh_secret_key_change_in_production_2026',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockTimeMinutes: parseInt(process.env.LOCK_TIME_MINUTES || '15', 10),
    bcryptRounds: 12,
  },

  payments: {
    provider: process.env.PAYMENT_PROVIDER || 'stripe_sandbox',
    publicKey: process.env.PAYMENT_PUBLIC_KEY || 'pk_test_sample',
    secretKey: process.env.PAYMENT_SECRET_KEY || 'sk_test_sample',
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_sample',
  },

  system: {
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'USD',
    dailyLimitDefault: parseFloat(process.env.TRANSACTION_DAILY_LIMIT || '50000.00'),
    riskHighThreshold: parseFloat(process.env.RISK_THRESHOLD_HIGH_AMOUNT || '10000.00'),
  },
};
