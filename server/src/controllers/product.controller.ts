import type { Request, Response } from 'express';
import type { FilterQuery, SortOrder } from 'mongoose';
import { ROLES } from '@shopswift/shared';
import { Product, type IProduct } from '../models/Product.model';
import { Team } from '../models/Team.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../utils/ApiResponse';
import { slugify } from '../utils/slugify';

interface ProductQuery {
  page: number;
  limit: number;
  team?: string;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

const SORT_MAP: Record<string, Record<string, SortOrder>> = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
  rating: { ratingsAverage: -1 },
  featured: { isFeatured: -1, createdAt: -1 },
};

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as ProductQuery;
  const filter: FilterQuery<IProduct> = { isActive: true };

  if (q.team) {
    const team = await Team.findOne({ slug: q.team });
    if (team) filter.team = team._id;
    else filter.team = null; // no matching team -> empty result set
  }
  if (q.category) filter.category = q.category;
  if (q.minPrice != null || q.maxPrice != null) {
    filter.price = {};
    if (q.minPrice != null) filter.price.$gte = q.minPrice;
    if (q.maxPrice != null) filter.price.$lte = q.maxPrice;
  }
  if (q.search) filter.$text = { $search: q.search };

  const sort = SORT_MAP[q.sort ?? 'newest'] ?? SORT_MAP.newest;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .populate('team', 'name slug colorPrimary'),
    Product.countDocuments(filter),
  ]);

  sendPaginated(
    res,
    products.map((p) => p.toJSON()),
    { page: q.page, limit: q.limit, total },
  );
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id).populate(
    'team',
    'name slug colorPrimary colorSecondary',
  );
  if (!product || !product.isActive) throw ApiError.notFound('Product not found');
  sendSuccess(res, 200, product.toJSON());
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const isRaceTeam = req.user!.role === ROLES.RACETEAM;

  let teamId: string;
  if (isRaceTeam) {
    if (!req.user!.team) throw ApiError.forbidden('Your account is not linked to a team');
    teamId = req.user!.team;
  } else {
    if (!req.body.team) throw ApiError.badRequest('team is required');
    teamId = req.body.team;
  }

  const team = await Team.findById(teamId);
  if (!team) throw ApiError.badRequest('Team not found');

  const product = await Product.create({
    ...req.body,
    team: team._id,
    slug: slugify(req.body.name),
    createdBy: req.user!.id,
  });

  sendSuccess(res, 201, product.toJSON(), 'Product created');
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  // `authorizeTeamOwnership` middleware has already loaded + authorized `req.resource`.
  const product = req.resource as IProduct;
  const updates = { ...req.body };
  if (updates.name) updates.slug = slugify(updates.name);
  delete updates.team; // team ownership is immutable after creation

  Object.assign(product, updates);
  await product.save();
  sendSuccess(res, 200, product.toJSON(), 'Product updated');
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = req.resource as IProduct;
  product.isActive = false;
  await product.save();
  sendSuccess(res, 200, null, 'Product removed');
});

export const updateStock = asyncHandler(async (req: Request, res: Response) => {
  const product = req.resource as IProduct;
  product.stock = req.body.stock;
  await product.save();
  sendSuccess(res, 200, product.toJSON(), 'Stock updated');
});
