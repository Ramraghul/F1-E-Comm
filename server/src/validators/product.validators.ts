import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '@shopswift/shared';
import { objectIdSchema } from './common.validators';

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10).max(3000),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.number().int().min(0, 'price must be a non-negative integer (cents)'),
  stock: z.number().int().min(0),
  sku: z.string().trim().min(2).max(50),
  images: z.array(z.string().url()).min(1, 'at least one image is required'),
  driverTag: z.string().trim().optional(),
  sizes: z.array(z.string().trim()).optional(),
  isFeatured: z.boolean().optional(),
  // Only an admin's payload is honored; forced to the caller's own team for raceteam users.
  team: objectIdSchema.optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  team: z.string().trim().optional(),
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  search: z.string().trim().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating', 'featured']).optional(),
});

export const stockUpdateSchema = z.object({
  stock: z.number().int().min(0),
});
