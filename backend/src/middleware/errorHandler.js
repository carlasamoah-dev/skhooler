/**
 * Global error handlers
 */
import { AppError, NotFoundError, ConflictError, InternalError, UnauthorizedError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/apiResponse.js';

export function notFoundHandler(req, res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.path}`));
}

export function errorHandler(err, req, res, next) {
  logger.error({ err, requestId: req.requestId }, 'Request error');

  if (err.isOperational) {
    err.requestId = req.requestId;
    return sendError(res, err);
  }

  // Prisma errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'resource';
    return sendError(res, new ConflictError(`A ${field} with this value already exists`));
  }
  if (err.code === 'P2025') {
    return sendError(res, new NotFoundError('Record not found'));
  }
  if (err.code === 'P2034') {
    const error = new InternalError('Transaction conflict');
    error.retryAfter = 1;
    return sendError(res, error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, new UnauthorizedError('Invalid or expired token'));
  }
  
  // Zod errors
  if (err.name === 'ZodError') {
    const details = err.issues?.map(i => ({ field: i.path.join('.'), message: i.message }));
    return sendError(res, new ValidationError('Validation error', details));
  }

  // Fallback
  const fallback = new InternalError('Internal server error');
  fallback.requestId = req.requestId;
  return sendError(res, fallback);
}
