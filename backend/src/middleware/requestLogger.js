/**
 * Request logging middleware
 */
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

export function requestLogger(req, res, next) {
  req.requestId = crypto.randomUUID();
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userId = req.user?.id || 'anonymous';

    logger.info({
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration,
      ip,
      userId
    }, 'Request completed');
  });

  next();
}
