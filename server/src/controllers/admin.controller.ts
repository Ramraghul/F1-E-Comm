import type { Request, Response } from 'express';
import { ORDER_STATUS, ROLES } from '@shopswift/shared';
import { User } from '../models/User.model';
import { Product } from '../models/Product.model';
import { Order } from '../models/Order.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';

export const getOverviewAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const [
    revenueAgg,
    totalOrders,
    totalUsers,
    totalRaceTeams,
    pendingRaceTeamApprovals,
    totalProducts,
    ordersByStatusAgg,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments(),
    User.countDocuments({ role: ROLES.USER }),
    User.countDocuments({ role: ROLES.RACETEAM, isApproved: true }),
    User.countDocuments({ role: ROLES.RACETEAM, isApproved: false }),
    Product.countDocuments({ isActive: true }),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const ordersByStatus: Record<string, number> = {};
  for (const status of Object.values(ORDER_STATUS)) ordersByStatus[status] = 0;
  for (const row of ordersByStatusAgg) ordersByStatus[row._id] = row.count;

  sendSuccess(res, 200, {
    totalRevenue: revenueAgg[0]?.total ?? 0,
    totalOrders,
    totalUsers,
    totalRaceTeams,
    pendingRaceTeamApprovals,
    totalProducts,
    ordersByStatus,
  });
});

export const getSalesByTeam = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.team',
        revenue: { $sum: '$items.subtotal' },
        unitsSold: { $sum: '$items.quantity' },
        orderIds: { $addToSet: '$_id' },
      },
    },
    {
      $lookup: { from: 'teams', localField: '_id', foreignField: '_id', as: 'team' },
    },
    { $unwind: '$team' },
    {
      $project: {
        _id: 0,
        team: {
          id: '$team._id',
          name: '$team.name',
          slug: '$team.slug',
          colorPrimary: '$team.colorPrimary',
        },
        revenue: 1,
        unitsSold: 1,
        orderCount: { $size: '$orderIds' },
      },
    },
    { $sort: { revenue: -1 } },
  ]);
  sendSuccess(res, 200, rows);
});

export const listPendingRaceTeams = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find({ role: ROLES.RACETEAM, isApproved: false }).populate(
    'team',
    'name slug',
  );
  sendSuccess(res, 200, users.map((u) => u.toJSON()));
});

export const approveRaceTeam = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.userId, role: ROLES.RACETEAM },
    { isApproved: true },
    { new: true },
  );
  if (!user) throw ApiError.notFound('Race Team application not found');
  sendSuccess(res, 200, user.toJSON(), 'Race Team account approved');
});

export const rejectRaceTeam = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.userId, role: ROLES.RACETEAM },
    { isActive: false },
    { new: true },
  );
  if (!user) throw ApiError.notFound('Race Team application not found');
  sendSuccess(res, 200, user.toJSON(), 'Race Team application rejected');
});
