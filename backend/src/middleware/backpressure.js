/**
 * Backpressure guard middleware
 */
import { ServiceUnavailableError } from '../utils/errors.js';

let isOverloaded = false;

setInterval(() => {
  const start = Date.now();
  setTimeout(() => {
    const lag = Date.now() - start - 50;
    const memUsage = process.memoryUsage();
    const heapRatio = memUsage.heapUsed / memUsage.heapTotal;
    
    isOverloaded = lag > 500 || heapRatio > 0.85;
  }, 50);
}, 1000).unref();

export function backpressureGuard(req, res, next) {
  if (isOverloaded) {
    return next(new ServiceUnavailableError('Server is temporarily overloaded', 5));
  }
  next();
}
