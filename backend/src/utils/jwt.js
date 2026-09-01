/**
 * @fileoverview JWT signing, verification, and token generation utilities.
 */
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * Sign a new access token for a user.
 * @param {string} userId - The user ID to encode in the 'sub' claim.
 * @returns {string} The signed JWT access token.
 */
export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
}

/**
 * Verify an access token.
 * @param {string} token - The access token to verify.
 * @returns {Object} The decoded payload { sub, iat, exp }.
 * @throws {Error} If token is invalid or expired.
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

/**
 * Generate a cryptographically secure random refresh token (not a JWT).
 * @returns {string} The random hex string.
 */
export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}
