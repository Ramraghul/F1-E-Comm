import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { setRefreshTokenCookie, clearRefreshTokenCookie, REFRESH_COOKIE_NAME } from '../utils/cookies';
import * as authService from '../services/auth.service';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';

function authResponsePayload(user: { toJSON: () => unknown }, tokens: { accessToken: string; accessTokenExpiresAt: Date }) {
  return {
    user: user.toJSON(),
    tokens: {
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt.toISOString(),
    },
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.register(req.body, req.headers['user-agent']);
  setRefreshTokenCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);
  sendSuccess(res, 201, authResponsePayload(user, tokens), 'Registration successful');
});

export const registerRaceTeam = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.registerRaceTeam(req.body);
  sendSuccess(
    res,
    201,
    { user: user.toJSON() },
    'Race Team application submitted. An admin must approve your account before you can log in.',
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login(email, password, req.headers['user-agent']);
  setRefreshTokenCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);
  sendSuccess(res, 200, authResponsePayload(user, tokens), 'Login successful');
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const cookieToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!cookieToken) throw ApiError.unauthorized('No refresh token provided');

  const { user, tokens } = await authService.refresh(cookieToken, req.headers['user-agent']);
  setRefreshTokenCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);
  sendSuccess(res, 200, authResponsePayload(user, tokens), 'Token refreshed');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const cookieToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (req.user) {
    await authService.logout(req.user.id, cookieToken);
  }
  clearRefreshTokenCookie(res);
  sendSuccess(res, 200, null, 'Logged out');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).populate(
    'team',
    'name slug colorPrimary colorSecondary colorAccent logoUrl',
  );
  if (!user) throw ApiError.notFound('User not found');
  sendSuccess(res, 200, user.toJSON());
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = await authService.forgotPassword(req.body.email);
  // In production this token would be emailed; for local/demo purposes we log it
  // so the "forgot password" flow can be exercised end-to-end without an email provider.
  if (rawToken) {
    logger.info(`Password reset token for ${req.body.email}: ${rawToken}`);
  }
  sendSuccess(res, 200, null, 'If that email exists, a password reset link has been sent');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.params.token as string, req.body.password);
  sendSuccess(res, 200, null, 'Password has been reset. Please log in again.');
});
