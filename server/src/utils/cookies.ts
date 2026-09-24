import type { Response } from 'express';
import { isProd } from '../config/env';

export const REFRESH_COOKIE_NAME = 'shopswift_refresh_token';

export function setRefreshTokenCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: expiresAt,
    path: '/api/v1/auth',
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/v1/auth',
  });
}
