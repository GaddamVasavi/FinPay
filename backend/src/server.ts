import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`====================================================`);
  logger.info(` FinPay API Server running in [${config.env}] mode`);
  logger.info(` Port: http://localhost:${config.port}`);
  logger.info(` Health Check: http://localhost:${config.port}/health`);
  logger.info(` Swagger Docs: http://localhost:${config.port}/api/docs`);
  logger.info(`====================================================`);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    logger.info('HTTP server closed successfully.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forceful shutdown triggered after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
