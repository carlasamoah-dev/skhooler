import { z } from 'zod';

/**
 * Validation schemas for authentication routes
 */

export const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(100).regex(/^[a-zA-Z\s'-]+$/, 'Only letters, spaces, hyphens, and apostrophes allowed'),
  lastName: z.string().trim().min(2).max(100).regex(/^[a-zA-Z\s'-]+$/, 'Only letters, spaces, hyphens, and apostrophes allowed'),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(100).regex(/^[a-zA-Z\s'-]+$/).optional(),
  lastName: z.string().trim().min(2).max(100).regex(/^[a-zA-Z\s'-]+$/).optional(),
  bio: z.string().max(500).nullable().optional(),
  username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores').optional(),
  location: z.string().max(100).nullable().optional(),
  socialLinks: z.array(z.object({
    platform: z.enum(['facebook', 'linkedin', 'instagram', 'youtube']),
    url: z.string().url().or(z.literal('')),
    isVisible: z.boolean().default(true)
  })).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional()
}).partial();
