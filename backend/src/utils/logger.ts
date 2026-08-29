import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Redact sensitive patterns (passwords, tokens, CVVs, full card numbers)
const sanitizeFormat = winston.format((info) => {
  if (typeof info.message === 'object') {
    info.message = sanitizeObject(info.message);
  }
  return info;
});

function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const copy = { ...obj };
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'refreshToken', 'secret', 'cvv', 'pan', 'cardToken'];
  for (const key of Object.keys(copy)) {
    if (sensitiveKeys.includes(key)) {
      copy[key] = '***REDACTED***';
    } else if (typeof copy[key] === 'object') {
      copy[key] = sanitizeObject(copy[key]);
    }
  }
  return copy;
}

const customFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] [${level}] ${stack || (typeof message === 'object' ? JSON.stringify(message) : message)}`;
});

export const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    sanitizeFormat(),
    config.env === 'production' ? json() : combine(colorize(), customFormat)
  ),
  transports: [
    new winston.transports.Console(),
  ],
});
