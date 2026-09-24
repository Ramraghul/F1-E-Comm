import type { Request, Response } from 'express';
import { Wishlist } from '../models/Wishlist.model';
import { Product } from '../models/Product.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';

async function populatedWishlist(userId: string) {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { new: true, upsert: true },
  ).populate({
    path: 'items.product',
    populate: { path: 'team', select: 'name slug colorPrimary' },
  });
  return wishlist!;
}

export const getMyWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await populatedWishlist(req.user!.id);
  sendSuccess(res, 200, wishlist.toJSON());
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw ApiError.notFound('Product not found');

  // Ensure the wishlist document exists first — this upsert is keyed only on `user`
  // (which has a unique index), so it's always safe regardless of whether one
  // already exists.
  await Wishlist.updateOne(
    { user: req.user!.id },
    { $setOnInsert: { user: req.user!.id, items: [] } },
    { upsert: true },
  );

  // Then atomically add the item only if it isn't already present. Deliberately no
  // `upsert` here: if the filter matches nothing because the item's already in the
  // list, this is a no-op — with upsert it would instead try to *insert* a second
  // document for this user and collide with the unique index above.
  await Wishlist.updateOne(
    { user: req.user!.id, 'items.product': { $ne: product._id } },
    { $push: { items: { product: product._id, addedAt: new Date() } } },
  );

  const wishlist = await populatedWishlist(req.user!.id);
  sendSuccess(res, 200, wishlist.toJSON(), 'Added to wishlist');
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  await Wishlist.updateOne({ user: req.user!.id }, { $pull: { items: { product: productId } } });

  const wishlist = await populatedWishlist(req.user!.id);
  sendSuccess(res, 200, wishlist.toJSON(), 'Removed from wishlist');
});
