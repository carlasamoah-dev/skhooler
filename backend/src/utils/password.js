/**
 * @fileoverview Password and token hashing utilities.
 */
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hash a plaintext password.
 * @param {string} password - The plaintext password.
 * @returns {Promise<string>} The hashed password.
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

/**
 * Compare a plaintext password with a hash.
 * @param {string} plain - The plaintext password.
 * @param {string} hash - The hashed password from DB.
 * @returns {Promise<boolean>} True if they match, false otherwise.
 */
export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/**
 * Hash a plain string token (e.g. refresh token, reset token) using SHA-256.
 * @param {string} token - The plain token.
 * @returns {string} The SHA-256 hex hash.
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
