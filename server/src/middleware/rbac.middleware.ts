import type { NextFunction, Request, Response } from 'express';
import type { Model, Types } from 'mongoose';
import { ROLES, type Role } from '@shopswift/shared';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

/** Restricts a route to the given roles. Must run after `protect`. */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
}

interface TeamOwnedDoc {
  team?: Types.ObjectId | { toString(): string } | null;
}

interface TeamOwnershipOptions {
  /** Route param holding the resource id. Defaults to "id". */
  idParam?: string;
  /** Property name on `req` to stash the loaded resource for controller reuse. Defaults to "resource". */
  attachAs?: string;
}

/**
 * Loads a `team`-owned resource (Product/Offer) and allows the request only if the
 * caller is an admin, or a raceteam user whose own team matches the resource's team.
 * This is the sole enforcement point for "a Race Team can only touch its own data".
 */
export function authorizeTeamOwnership<T extends TeamOwnedDoc>(
  model: Model<T>,
  options: TeamOwnershipOptions = {},
) {
  const idParam = options.idParam ?? 'id';
  const attachAs = options.attachAs ?? 'resource';

  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const doc = await model.findById(req.params[idParam]);
    if (!doc) throw ApiError.notFound('Resource not found');

    const isAdmin = req.user.role === ROLES.ADMIN;
    const isOwningTeam =
      req.user.role === ROLES.RACETEAM &&
      !!req.user.team &&
      !!doc.team &&
      doc.team.toString() === req.user.team;

    if (!isAdmin && !isOwningTeam) {
      throw ApiError.forbidden('You do not have access to this resource');
    }

    (req as Request & Record<string, unknown>)[attachAs] = doc;
    next();
  });
}
