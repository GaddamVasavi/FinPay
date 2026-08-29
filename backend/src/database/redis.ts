import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

class CacheService {
  private client: Redis | null = null;
  private memoryStore: Map<string, { value: string; expiresAt: number }> = new Map();
  private isRedisConnected: boolean = false;

  constructor() {
    try {
      this.client = new Redis(config.redis.url, {
        retryStrategy: (times) => {
          if (times > 3) {
            logger.warn('Redis connection failed. Falling back to in-memory cache.');
            return null; // Stop retrying
          }
          return Math.min(times * 100, 2000);
        },
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
      });

      this.client.on('connect', () => {
        this.isRedisConnected = true;
        logger.info('Connected to Redis successfully');
      });

      this.client.on('error', (err) => {
        this.isRedisConnected = false;
        // Suppress unhandled noisy connection logs
      });
    } catch (e) {
      this.isRedisConnected = false;
      logger.warn('Redis initialization skipped, using memory cache.');
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isRedisConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (err) {
        // Fallback to memory
      }
    }

    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds: number = 300): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        await this.client.set(key, value, 'EX', ttlSeconds);
        return;
      } catch (err) {
        // Fallback to memory
      }
    }

    this.memoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err) {
        // Fallback
      }
    }
    this.memoryStore.delete(key);
  }
}

export const cache = new CacheService();
