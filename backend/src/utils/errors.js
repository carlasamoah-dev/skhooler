/**
 * @fileoverview Custom application error classes for standardized error handling.
 */

/**
 * Base custom error class for the application.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Application specific error code
   * @param {any} [details=null] - Additional error details
   */
  constructor(message, statusCode, code, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class ValidationError extends AppError {
  /**
   * @param {string|Array} messageOrDetails - Error message string or details array
   * @param {Array} [details=null] - Validation error details (if first arg is message)
   */
  constructor(messageOrDetails, details = null) {
    if (typeof messageOrDetails === 'string') {
      super(messageOrDetails, 400, 'VALIDATION_ERROR', details);
    } else {
      super('Validation Error', 400, 'VALIDATION_ERROR', messageOrDetails);
    }
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  /**
   * @param {string} resourceOrMessage - Resource name (e.g. 'User') or full message
   */
  constructor(resourceOrMessage = 'Resource') {
    const message = resourceOrMessage.toLowerCase().endsWith('not found')
      ? resourceOrMessage
      : `${resourceOrMessage} not found`;
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  /**
   * @param {string|number} messageOrRetryAfter - Message or retryAfter seconds
   * @param {number} [retryAfter=null] - Seconds until retry is allowed
   */
  constructor(messageOrRetryAfter = 'Too many requests, please try again later', retryAfter = null) {
    if (typeof messageOrRetryAfter === 'number') {
      super('Too many requests, please try again later', 429, 'RATE_LIMIT_EXCEEDED');
      this.retryAfter = messageOrRetryAfter;
    } else {
      super(messageOrRetryAfter, 429, 'RATE_LIMIT_EXCEEDED');
      this.retryAfter = retryAfter;
    }
  }
}

export class InternalError extends AppError {
  constructor(message) {
    super(message, 500, 'INTERNAL_ERROR');
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message, retryAfter = null) {
    super(message, 503, 'SERVICE_UNAVAILABLE');
    if (retryAfter) {
      this.retryAfter = retryAfter;
    }
  }
}
