import { authService } from './auth.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

/**
 * Controller for auth endpoints
 */

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const refreshTokens = async (req, res, next) => {
  try {
    const result = await authService.refreshTokens(req.body);
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout({ ...req.body, userId: req.user.id });
    sendSuccess(res, { message: 'Logged out successfully' }, 200);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body);
    sendSuccess(res, { message: 'If email exists, reset link has been sent' }, 200);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body);
    sendSuccess(res, { message: 'Password reset successful' }, 200);
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.body);
    sendSuccess(res, { message: 'Email verified successfully' }, 200);
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    await authService.resendVerification(req.body);
    sendSuccess(res, { message: 'If unverified email exists, new link sent' }, 200);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    sendSuccess(res, user, 200);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await authService.updateProfile(req.user.id, req.body);
    sendSuccess(res, updatedUser, 200);
  } catch (error) {
    next(error);
  }
};
