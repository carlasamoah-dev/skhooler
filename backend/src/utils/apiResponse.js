/**
 * @fileoverview API response formatting utilities.
 */
import { AppError } from './errors.js';
import { logger } from './logger.js';

/**
 * Send a standardized success response.
 * Supports two calling conventions:
 *   sendSuccess(res, data, statusCode)     — positional
 *   sendSuccess(res, { data, message, meta, statusCode }) — options object
 *
 * @param {import('express').Response} res - Express response object
 * @param {any} [dataOrOptions=null] - Response data or options object
 * @param {number} [statusCode=200] - HTTP status code (positional mode)
 */
export function sendSuccess(res, dataOrOptions = null, statusCode = 200) {
  const payload = { success: true };

  // Detect options-object mode: has explicit 'data', 'message', or 'meta' key
  if (
    dataOrOptions !== null &&
    typeof dataOrOptions === 'object' &&
    !Array.isArray(dataOrOptions) &&
    ('data' in dataOrOptions || 'message' in dataOrOptions || 'meta' in dataOrOptions)
  ) {
    const { data = null, message = null, meta = null, statusCode: code = statusCode } = dataOrOptions;
    if (data !== null) payload.data = data;
    if (message !== null) payload.message = message;
    if (meta !== null) payload.meta = meta;
    return res.status(code).json(payload);
  }

  // Positional mode: dataOrOptions is the raw data
  if (dataOrOptions !== null) payload.data = dataOrOptions;
  return res.status(statusCode).json(payload);
}

/**
 * Send a standardized error response.
 * @param {import('express').Response} res - Express response object
 * @param {Error} error - The error object
 */
export function sendError(res, error) {
  if (error instanceof AppError) {
    const payload = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };

    if (error.details) payload.error.details = error.details;
    if (error.retryAfter) {
      payload.error.retryAfter = error.retryAfter;
      res.set('Retry-After', String(error.retryAfter));
    }

    return res.status(error.statusCode).json(payload);
  }

  // Handle unexpected/unknown errors
  logger.error({ err: error }, 'Unhandled error occurred');
  
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    },
  });
}
