import { z } from 'zod';
import { ORDER_STATUS } from '@shopswift/shared';
import { objectIdSchema } from './common.validators';

const addressSchema = z.object({
  label: z.string().trim().min(1).default('Shipping'),
  line1: z.string().trim().min(1),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  postalCode: z.string().trim().min(1),
  country: z.string().trim().min(1),
  isDefault: z.boolean().optional().default(false),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: objectIdSchema,
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .min(1, 'At least one item is required'),
  shippingAddress: addressSchema,
  offerCode: z.string().trim().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PAID,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
  ]),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum([
      ORDER_STATUS.PENDING,
      ORDER_STATUS.PAID,
      ORDER_STATUS.PROCESSING,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.DELIVERED,
      ORDER_STATUS.CANCELLED,
    ])
    .optional(),
});
