import { z } from 'zod';
import { OFFER_DISCOUNT_TYPE, OFFER_SCOPE, OFFER_TAGS } from '@shopswift/shared';
import { objectIdSchema } from './common.validators';

export const createOfferSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[A-Za-z0-9_-]+$/, 'code may only contain letters, numbers, - and _'),
    description: z.string().trim().min(3).max(500),
    discountType: z.enum([OFFER_DISCOUNT_TYPE.PERCENT, OFFER_DISCOUNT_TYPE.FLAT]),
    discountValue: z.number().positive(),
    scope: z.enum([OFFER_SCOPE.GLOBAL, OFFER_SCOPE.TEAM]),
    team: objectIdSchema.optional(),
    minOrderValue: z.number().int().min(0).default(0),
    maxDiscountAmount: z.number().int().positive().optional(),
    usageLimit: z.number().int().positive().optional(),
    usageLimitPerUser: z.number().int().positive().default(1),
    startsAt: z.coerce.date(),
    expiresAt: z.coerce.date(),
    tag: z.enum(OFFER_TAGS).optional(),
  })
  .refine((data) => data.expiresAt > data.startsAt, {
    message: 'expiresAt must be after startsAt',
    path: ['expiresAt'],
  })
  .refine((data) => data.scope !== OFFER_SCOPE.TEAM || !!data.team, {
    message: 'team is required when scope is "team"',
    path: ['team'],
  })
  .refine((data) => data.discountType !== OFFER_DISCOUNT_TYPE.PERCENT || data.discountValue <= 100, {
    message: 'percent discount cannot exceed 100',
    path: ['discountValue'],
  });

export const updateOfferSchema = z.object({
  description: z.string().trim().min(3).max(500).optional(),
  discountValue: z.number().positive().optional(),
  minOrderValue: z.number().int().min(0).optional(),
  maxDiscountAmount: z.number().int().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  usageLimitPerUser: z.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  tag: z.enum(OFFER_TAGS).optional(),
  isActive: z.boolean().optional(),
});

export const validateOfferSchema = z.object({
  code: z.string().trim().min(1),
});
