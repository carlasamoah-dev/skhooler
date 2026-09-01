/**
 * Concurrency limit middleware
 */
import { redis } from '../config/redis.js';
import { RateLimitError } from '../utils/errors.js';

export function concurrencyLimit(maxConcurrent = 10) {
  return async (req, res, next) => {
    if (!req.user) return next();
    
    const key = `conc:${req.user.id}`;
    let decremented = false;
    
    const decrement = async () => {
      if (!decremented) {
        decremented = true;
        try {
          await redis.decr(key);
        } catch (err) {
          // Ignore
        }
      }
    };
    
    try {
      const count = await redis.incr(key);
      await redis.expire(key, 30);
      
      if (count > maxConcurrent) {
        await decrement();
        throw new RateLimitError('Too many concurrent requests', 5);
      }
      
      res.on('finish', decrement);
      res.on('close', decrement);
      
      next();
    } catch (error) {
      next(error);
    }
  };
}
