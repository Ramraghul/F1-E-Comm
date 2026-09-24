import type { Request, Response } from 'express';
import { Cart } from '../models/Cart.model';
import { Product } from '../models/Product.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';

async function getOrCreateCart(userId: string) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

async function populatedCart(userId: string) {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    populate: { path: 'team', select: 'name slug colorPrimary' },
  });
  return cart ?? (await getOrCreateCart(userId));
}

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await populatedCart(req.user!.id);
  sendSuccess(res, 200, cart.toJSON());
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity = 1 } = req.body as { productId: string; quantity?: number };

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw ApiError.notFound('Product not found');

  const cart = await getOrCreateCart(req.user!.id);
  const existing = cart.items.find((i) => i.product.toString() === productId);

  const desiredQty = (existing?.quantity ?? 0) + quantity;
  if (desiredQty > product.stock) {
    throw ApiError.conflict(`Only ${product.stock} of "${product.name}" available`);
  }

  if (existing) existing.quantity = desiredQty;
  else cart.items.push({ product: product._id, quantity });

  await cart.save();
  sendSuccess(res, 200, (await populatedCart(req.user!.id)).toJSON(), 'Item added to cart');
});

export const updateItemQuantity = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { quantity } = req.body as { quantity: number };

  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');
  if (quantity > product.stock) {
    throw ApiError.conflict(`Only ${product.stock} of "${product.name}" available`);
  }

  const cart = await getOrCreateCart(req.user!.id);
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw ApiError.notFound('Item not in cart');

  item.quantity = quantity;
  await cart.save();
  sendSuccess(res, 200, (await populatedCart(req.user!.id)).toJSON(), 'Cart updated');
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.user!.id);
  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();
  sendSuccess(res, 200, (await populatedCart(req.user!.id)).toJSON(), 'Item removed');
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  cart.items = [];
  await cart.save();
  sendSuccess(res, 200, cart.toJSON(), 'Cart cleared');
});

export const mergeGuestCart = asyncHandler(async (req: Request, res: Response) => {
  const guestItems = req.body.items as { productId: string; quantity: number }[];
  const cart = await getOrCreateCart(req.user!.id);

  for (const guestItem of guestItems) {
    const product = await Product.findById(guestItem.productId);
    if (!product || !product.isActive) continue;

    const existing = cart.items.find((i) => i.product.toString() === guestItem.productId);
    const merged = Math.min((existing?.quantity ?? 0) + guestItem.quantity, product.stock);
    if (existing) existing.quantity = merged;
    else if (merged > 0) cart.items.push({ product: product._id, quantity: merged });
  }

  await cart.save();
  sendSuccess(res, 200, (await populatedCart(req.user!.id)).toJSON(), 'Cart merged');
});
