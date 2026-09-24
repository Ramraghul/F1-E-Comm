import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { ROLES } from '@shopswift/shared';
import { Review } from '../models/Review.model';
import { Product } from '../models/Product.model';
import { Order } from '../models/Order.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';

async function recalculateProductRating(productId: string): Promise<void> {
  const stats = await Review.aggregate([
    { $match: { product: new Types.ObjectId(productId) } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] ?? {};
  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: Math.round(avg * 10) / 10,
    ratingsCount: count,
  });
}

export const listReviewsForProduct = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ product: req.params.productId })
    .sort({ createdAt: -1 })
    .populate('user', 'name');
  sendSuccess(res, 200, reviews.map((r) => r.toJSON()));
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  // Guaranteed present by the router's objectIdSchema param validation.
  const productId = req.params.productId as string;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw ApiError.notFound('Product not found');

  const existing = await Review.findOne({ product: productId, user: req.user!.id });
  if (existing) throw ApiError.conflict('You have already reviewed this product');

  const isVerifiedPurchase = await Order.exists({
    user: req.user!.id,
    'items.product': productId,
    paymentStatus: 'paid',
  });

  const review = await Review.create({
    product: productId,
    user: req.user!.id,
    rating: req.body.rating,
    comment: req.body.comment,
    isVerifiedPurchase: !!isVerifiedPurchase,
  });

  await recalculateProductRating(productId);
  sendSuccess(res, 201, review.toJSON(), 'Review submitted');
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');

  const isOwner = review.user.toString() === req.user!.id;
  const isAdmin = req.user!.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) throw ApiError.forbidden('You cannot delete this review');

  await review.deleteOne();
  await recalculateProductRating(review.product.toString());
  sendSuccess(res, 200, null, 'Review deleted');
});
