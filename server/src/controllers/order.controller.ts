import type { Request, Response } from 'express';
import type { FilterQuery } from 'mongoose';
import { ORDER_STATUS, ROLES } from '@shopswift/shared';
import { Order, type IOrder } from '../models/Order.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../utils/ApiResponse';
import * as orderService from '../services/order.service';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { order, clientSecret } = await orderService.createOrder(req.user!.id, req.body);
  sendSuccess(res, 201, { order: order.toJSON(), clientSecret }, 'Order created');
});

export const listMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query as unknown as { page: number; limit: number };
  const filter = { user: req.user!.id };
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);
  sendPaginated(res, orders.map((o) => o.toJSON()), { page, limit, total });
});

async function loadOrderForViewer(orderId: string, viewer: NonNullable<Request['user']>) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');

  const isOwner = order.user.toString() === viewer.id;
  const isAdmin = viewer.role === ROLES.ADMIN;
  const isRaceTeamOnOrder =
    viewer.role === ROLES.RACETEAM &&
    !!viewer.team &&
    order.items.some((i) => i.team.toString() === viewer.team);

  if (!isOwner && !isAdmin && !isRaceTeamOnOrder) {
    throw ApiError.forbidden('You do not have access to this order');
  }
  return order;
}

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await loadOrderForViewer(req.params.id as string, req.user!);
  sendSuccess(res, 200, order.toJSON());
});

export const cancelMyOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.user.toString() !== req.user!.id) {
    throw ApiError.forbidden('You do not have access to this order');
  }
  if (order.status !== ORDER_STATUS.PENDING) {
    throw ApiError.badRequest('Only pending (unpaid) orders can be cancelled');
  }

  order.status = ORDER_STATUS.CANCELLED;
  order.statusHistory.push({ status: ORDER_STATUS.CANCELLED, changedAt: new Date() });
  await order.save();
  sendSuccess(res, 200, order.toJSON(), 'Order cancelled');
});

export const listAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = req.query as unknown as {
    page: number;
    limit: number;
    status?: string;
  };
  const filter: FilterQuery<IOrder> = status ? { status } : {};
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email'),
    Order.countDocuments(filter),
  ]);
  sendPaginated(res, orders.map((o) => o.toJSON()), { page, limit, total });
});

export const listTeamOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query as unknown as { page: number; limit: number };
  const filter = { 'items.team': req.user!.team };
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);
  sendPaginated(res, orders.map((o) => o.toJSON()), { page, limit, total });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  const updated = await orderService.transitionOrderStatus(order, req.body.status, req.user!);
  sendSuccess(res, 200, updated.toJSON(), 'Order status updated');
});
