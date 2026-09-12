import { authService } from './auth.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

/**
 * Controller for auth endpoints
 */

const setTokenCookies = (res, result) => {
  if (result.accessToken) {
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
  }
  if (result.refreshToken) {
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }
};

const clearTokenCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    setTokenCookies(res, result);
    const { accessToken, refreshToken, ...safeResult } = result;
    sendSuccess(res, safeResult, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    setTokenCookies(res, result);
    const { accessToken, refreshToken, ...safeResult } = result;
    sendSuccess(res, safeResult, 200);
  } catch (error) {
    next(error);
  }
};

export const refreshTokens = async (req, res, next) => {
  try {
    // If using cookies, the refresh token will be in req.cookies.refreshToken
    // but the frontend might also send it in the body. We check both.
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      const { UnauthorizedError } = await import('../../utils/errors.js');
      return next(new UnauthorizedError('No refresh token provided'));
    }
    const result = await authService.refreshTokens({ refreshToken });
    setTokenCookies(res, result);
    const { accessToken, refreshToken: newRefresh, ...safeResult } = result;
    sendSuccess(res, safeResult, 200);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (refreshToken) {
      await authService.logout({ refreshToken, userId: req.user.id });
    }
    clearTokenCookies(res);
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
