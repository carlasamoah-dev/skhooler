import crypto from 'crypto';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { AppError, BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../../utils/errors.js';
import { signAccessToken, verifyAccessToken, generateRefreshToken } from '../../utils/jwt.js';
import { hashPassword, comparePassword, hashToken } from '../../utils/password.js';
import { emailQueue } from '../../jobs/queue.js';

/**
 * Authentication service business logic
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} data User registration data
   * @returns {Object} User and tokens
   */
  async register({ firstName, lastName, email, password }) {
    const existingUser = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    const hashedPassword = await hashPassword(password);
    
    // Create verification token
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = hashToken(rawVerificationToken);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash: hashedPassword,
          isEmailVerified: false,
        },
      });

      await tx.emailVerificationToken.create({
        data: {
          userId: newUser.id,
          tokenHash: hashedVerificationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      return newUser;
    });

    // Queue verification email
    const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${rawVerificationToken}`;
    await emailQueue.add('email-verification', {
      type: 'email-verification',
      to: email,
      data: { firstName, verificationUrl },
    });

    return this._generateTokenPair(user);
  }

  /**
   * Authenticate a user
   * @param {Object} data Login credentials
   * @returns {Object} User and tokens
   */
  async login({ email, password }) {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedError('No account found with that email address. Please check your email or sign up.');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Incorrect password. Please try again or reset your password.');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedError('Your email address has not been verified yet. Please check your inbox for the verification link.');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this._generateTokenPair(user);
  }

  /**
   * Refresh authentication tokens
   * @param {Object} data Object containing refreshToken
   * @returns {Object} New token pair
   */
  async refreshTokens({ refreshToken }) {
    const tokenHash = hashToken(refreshToken);

    const tokenRecord = await prisma.refreshToken.findFirst({
      where: { tokenHash },
    });

    if (!tokenRecord) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    if (tokenRecord.revokedAt) {
      // Reuse detected, revoke all tokens in family
      await prisma.refreshToken.updateMany({
        where: { familyId: tokenRecord.familyId },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedError('Session compromised. Please log in again.');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError('Token expired');
    }

    // Revoke current
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    // Create new tokens with same familyId
    const newAccessToken = signAccessToken(tokenRecord.userId);
    const newRefreshTokenRaw = generateRefreshToken();
    const newRefreshTokenHash = hashToken(newRefreshTokenRaw);

    await prisma.refreshToken.create({
      data: {
        userId: tokenRecord.userId,
        tokenHash: newRefreshTokenHash,
        familyId: tokenRecord.familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenRaw,
    };
  }

  /**
   * Log out user
   * @param {Object} data Logout data
   */
  async logout({ refreshToken, userId }) {
    const tokenHash = hashToken(refreshToken);
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: { tokenHash, userId },
    });

    if (tokenRecord) {
      await prisma.refreshToken.updateMany({
        where: { familyId: tokenRecord.familyId },
        data: { revokedAt: new Date() },
      });
    }
  }

  /**
   * Request password reset
   * @param {Object} data 
   */
  async forgotPassword({ email }) {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (!user) {
      return; // Prevent email enumeration
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);

    await prisma.$transaction(async (tx) => {
      // Invalidate existing
      await tx.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });

      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });
    });

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await emailQueue.add('password-reset', {
      type: 'password-reset',
      to: email,
      data: { firstName: user.firstName, resetUrl },
    });
  }

  /**
   * Reset password
   * @param {Object} data 
   */
  async resetPassword({ token, newPassword }) {
    const tokenHash = hashToken(token);

    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new BadRequestError('Invalid or expired reset link');
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash: hashedPassword },
      });

      await tx.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      });

      await tx.refreshToken.updateMany({
        where: { userId: tokenRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });
  }

  /**
   * Verify email address
   * @param {Object} data 
   */
  async verifyEmail({ token }) {
    const tokenHash = hashToken(token);

    const tokenRecord = await prisma.emailVerificationToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });

    if (!tokenRecord) {
      throw new BadRequestError('Invalid or expired verification link');
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: { isEmailVerified: true },
      });

      await tx.emailVerificationToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      });
    });
  }

  /**
   * Resend verification email
   * @param {Object} data 
   */
  async resendVerification({ email }) {
    const user = await prisma.user.findFirst({
      where: { email, isEmailVerified: false, deletedAt: null },
    });

    if (!user) return; // Prevent enumeration

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);

    await prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.updateMany({
        where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });

      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });
    });

    const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;
    await emailQueue.add('email-verification', {
      type: 'email-verification',
      to: email,
      data: { firstName: user.firstName, verificationUrl },
    });
  }

  /**
   * Get user profile
   * @param {string} userId 
   * @returns {Object}
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        location: true,
        socialLinks: true,
        avatarUrl: true,
        bio: true,
        isEmailVerified: true,
        createdAt: true,
        groupMemberships: {
          include: {
            group: {
              select: { slug: true, name: true, iconUrl: true }
            }
          }
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   * @param {string} userId 
   * @param {Object} data 
   * @returns {Object}
   */
  async updateProfile(userId, data) {
    if (data.username) {
      const existingUser = await prisma.user.findFirst({
        where: { username: data.username, id: { not: userId } }
      });
      if (existingUser) {
        throw new BadRequestError('Username is already taken');
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        location: true,
        socialLinks: true,
        avatarUrl: true,
        bio: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Generates access and refresh tokens
   * @private
   */
  async _generateTokenPair(user) {
    const accessToken = signAccessToken(user.id);
    const refreshTokenRaw = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshTokenRaw);
    const familyId = crypto.randomUUID();

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: this._sanitizeUser(user),
      accessToken,
      refreshToken: refreshTokenRaw,
    };
  }

  /**
   * Remove sensitive fields
   * @private
   */
  _sanitizeUser(user) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();
