import crypto from 'crypto';
import { prisma } from '../src/config/database.js';
import { hashPassword } from '../src/utils/password.js';
import { signAccessToken, generateRefreshToken } from '../src/utils/jwt.js';

/**
 * Creates a test user in the database
 * @param {Object} overrides Partial user object
 */
export async function createTestUser(overrides = {}) {
  const defaultData = {
    firstName: 'Test',
    lastName: 'User',
    email: `test-${Date.now()}@example.com`,
    passwordHash: await hashPassword('Test@1234'),
    isEmailVerified: true,
  };
  
  return await prisma.user.create({
    data: { ...defaultData, ...overrides },
  });
}

/**
 * Generates an access token and refresh token for a user
 * @param {string} userId
 */
export function getAuthTokens(userId) {
  return {
    accessToken: signAccessToken(userId),
    refreshToken: generateRefreshToken(),
  };
}

/**
 * Truncates database tables for a clean slate
 */
export async function cleanDatabase() {
  const tables = ['RefreshToken', 'PasswordResetToken', 'EmailVerificationToken', 'User'];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
}
