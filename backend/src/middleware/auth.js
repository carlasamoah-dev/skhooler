/**
 * Authentication middleware
 */
import { UnauthorizedError } from '../utils/errors.js';
import { verifyAccessToken } from '../utils/jwt.js';

export async function authenticate(req, res, next) {
  try {
    let token = req.cookies?.accessToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    try {
      const decoded = await verifyAccessToken(token);
      req.user = { id: decoded.sub };
      next();
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req, res, next) {
  try {
    let token = req.cookies?.accessToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = await verifyAccessToken(token);
      req.user = { id: decoded.sub };
      next();
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
}
