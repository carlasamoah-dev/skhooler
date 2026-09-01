/**
 * @fileoverview Redis client singleton configuration using IORedis.
 */
import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * Singleton IORedis client.
 * @type {Redis}
 */
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Successfully connected to Redis.');
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error.');
});

redis.on('close', () => {
  logger.warn('Redis connection closed.');
});
