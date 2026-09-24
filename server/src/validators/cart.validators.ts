import { z } from 'zod';
import { objectIdSchema } from './common.validators';

export const addCartItemSchema = z.object({
  productId: objectIdSchema,
  quantity: z.number().int().min(1).max(50).optional().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(50),
});

export const productIdParamSchema = z.object({
  productId: objectIdSchema,
});

export const mergeCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: objectIdSchema,
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .default([]),
});
