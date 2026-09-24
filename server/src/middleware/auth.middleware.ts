import type { NextFunction, Request, Response } from 'express';
import { User } from '../models/User.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyAccessToken } from '../services/token.service';

/** Verifies the bearer access token and attaches `req.user`. */
export const protect = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication required');
  }
  const token = header.slice('Bearer '.length);

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Account not found or deactivated');
  }

  req.user = { id: user.id, role: user.role, team: user.team ? user.team.toString() : null };
  next();
});

/** Attaches `req.user` if a valid token is present, but never rejects the request. */
export const optionalAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();
    try {
      const payload = verifyAccessToken(header.slice('Bearer '.length));
      const user = await User.findById(payload.sub);
      if (user?.isActive) {
        req.user = { id: user.id, role: user.role, team: user.team ? user.team.toString() : null };
      }
    } catch {
      // ignore invalid/expired token for optional auth
    }
    next();
  },
);
