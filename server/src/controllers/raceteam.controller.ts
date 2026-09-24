import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Order } from '../models/Order.model';
import { Product } from '../models/Product.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';

export const getMyTeamAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.user!.team;
  if (!teamId) throw ApiError.forbidden('Your account is not linked to a team');
  const teamObjectId = new Types.ObjectId(teamId);

  const [summaryAgg, topProducts, lowStockProducts] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $match: { 'items.team': teamObjectId } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$items.subtotal' },
          unitsSold: { $sum: '$items.quantity' },
          orderIds: { $addToSet: '$_id' },
        },
      },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $match: { 'items.team': teamObjectId } },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, productId: '$_id', name: 1, unitsSold: 1, revenue: 1 } },
    ]),
    Product.find({ team: teamId, isActive: true, stock: { $lte: 5 } })
      .select('name stock')
      .sort({ stock: 1 })
      .limit(10),
  ]);

  const summary = summaryAgg[0] ?? { revenue: 0, unitsSold: 0, orderIds: [] };

  sendSuccess(res, 200, {
    revenue: summary.revenue,
    unitsSold: summary.unitsSold,
    orderCount: summary.orderIds.length,
    topProducts,
    lowStockProducts: lowStockProducts.map((p) => ({
      productId: p.id,
      name: p.name,
      stock: p.stock,
    })),
  });
});
