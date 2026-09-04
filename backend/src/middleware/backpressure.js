/**
 * @fileoverview Backpressure guard middleware.
 * Rejects requests with 503 when the server is under extreme load.
 * Uses event loop lag and RSS memory (not heap ratio) for accurate detection.
 */
import { ServiceUnavailableError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

let isOverloaded = false;
let lastCheck = { lag: 0, memoryMB: 0 };

/**
 * Check system health every 2 seconds.
 * Uses RSS (Resident Set Size) instead of heap ratio — RSS reflects
 * actual OS memory usage and doesn't give false positives on startup.
 */
const MEMORY_LIMIT_MB = parseInt(process.env.BACKPRESSURE_MEMORY_MB || '512', 10);
const EVENT_LOOP_LAG_MS = parseInt(process.env.BACKPRESSURE_LAG_MS || '500', 10);

setInterval(() => {
  const start = Date.now();
  setTimeout(() => {
    const lag = Date.now() - start - 50;
    const memUsage = process.memoryUsage();
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);

    lastCheck = { lag, memoryMB: rssMB };

    const wasOverloaded = isOverloaded;
    isOverloaded = lag > EVENT_LOOP_LAG_MS || rssMB > MEMORY_LIMIT_MB;

    // Log state changes
    if (isOverloaded && !wasOverloaded) {
      logger.warn({ lag, rssMB, limit: MEMORY_LIMIT_MB }, 'Backpressure: server overloaded');
    } else if (!isOverloaded && wasOverloaded) {
      logger.info({ lag, rssMB }, 'Backpressure: server recovered');
    }
  }, 50);
}, 2000).unref();

/**
 * Express middleware that rejects requests when the system is overloaded.
 */
export function backpressureGuard(req, res, next) {
  if (isOverloaded) {
    logger.warn({ ...lastCheck, path: req.path }, 'Request rejected: backpressure');
    return next(new ServiceUnavailableError('Server is temporarily overloaded', 5));
  }
  next();
}
