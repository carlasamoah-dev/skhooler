import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validateRequest.js';
import { authLimiter, strictLimiter } from '../../middleware/rateLimiter.js';
import { 
  registerSchema, loginSchema, refreshSchema, 
  forgotPasswordSchema, resetPasswordSchema, 
  verifyEmailSchema, resendVerificationSchema, 
  updateProfileSchema 
} from './auth.schema.js';

/**
 * Authentication routes definition
 */
const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', authLimiter, validateBody(refreshSchema), authController.refreshTokens);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', strictLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', strictLimiter, validateBody(resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', validateBody(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', strictLimiter, validateBody(resendVerificationSchema), authController.resendVerification);
router.get('/me', authenticate, authController.getProfile);
router.patch('/me', authenticate, validateBody(updateProfileSchema), authController.updateProfile);

export default router;
