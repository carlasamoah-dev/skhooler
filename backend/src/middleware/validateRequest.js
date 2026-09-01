/**
 * Request validation middleware
 */
import { ValidationError } from '../utils/errors.js';

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message
      }));
      return next(new ValidationError('Validation error', details));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const details = result.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message
      }));
      return next(new ValidationError('Validation error', details));
    }
    req.query = result.data;
    next();
  };
}
