/**
 * Rate limiter middleware using Redis
 */
import { redis } from '../config/redis.js';
import { RateLimitError } from '../utils/errors.js';

export function createRateLimiter({ prefix, max, windowSeconds }) {
  return async (req, res, next) => {
    try {
      const identifier = req.user?.id || req.ip;
      const key = `rl:${prefix}:${identifier}`;
      const now = Date.now();
      const windowStart = now - windowSeconds * 1000;
      
      const multi = redis.multi();
      multi.zadd(key, now, `${now}-${Math.random()}`);
      multi.zremrangebyscore(key, 0, windowStart);
      multi.zcard(key);
      multi.expire(key, windowSeconds);
      
      const results = await multi.exec();
      const count = results[2][1];
      
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(now / 1000) + windowSeconds);
      
      if (count > max) {
        throw new RateLimitError('Too many requests, please try again later', windowSeconds);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const globalLimiter = createRateLimiter({ prefix: 'global', max: 100, windowSeconds: 60 });
export const authLimiter = createRateLimiter({ prefix: 'auth', max: 5, windowSeconds: 60 });
export const strictLimiter = createRateLimiter({ prefix: 'strict', max: 3, windowSeconds: 300 });
