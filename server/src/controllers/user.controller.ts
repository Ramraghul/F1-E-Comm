import type { Request, Response } from 'express';
import { User } from '../models/User.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../utils/ApiResponse';

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');
  sendSuccess(res, 200, user.toJSON());
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.user!.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound('User not found');
  sendSuccess(res, 200, user.toJSON(), 'Profile updated');
});

export const updateMyPassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).select('+password +refreshTokens');
  if (!user) throw ApiError.notFound('User not found');

  const { currentPassword, newPassword } = req.body;
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  user.password = newPassword;
  user.refreshTokens = []; // force re-login on all other devices
  await user.save();
  sendSuccess(res, 200, null, 'Password updated. Please log in again.');
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, role } = req.query as unknown as {
    page: number;
    limit: number;
    role?: string;
  };
  const filter = role ? { role } : {};
  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('team', 'name slug'),
    User.countDocuments(filter),
  ]);
  sendPaginated(
    res,
    users.map((u) => u.toJSON()),
    { page, limit, total },
  );
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).populate('team', 'name slug');
  if (!user) throw ApiError.notFound('User not found');
  sendSuccess(res, 200, user.toJSON());
});

export const adminUpdateUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.params.id === req.user!.id && (req.body.isActive === false || req.body.role)) {
    throw ApiError.badRequest('You cannot deactivate or change the role of your own account');
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound('User not found');
  sendSuccess(res, 200, user.toJSON(), 'User updated');
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.params.id === req.user!.id) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  sendSuccess(res, 200, null, 'User deleted');
});
