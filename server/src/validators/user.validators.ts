import { z } from 'zod';
import { ROLE_VALUES } from '@shopswift/shared';

const addressSchema = z.object({
  label: z.string().trim().min(1),
  line1: z.string().trim().min(1),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  postalCode: z.string().trim().min(1),
  country: z.string().trim().min(1),
  isDefault: z.boolean().optional().default(false),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  addresses: z.array(addressSchema).optional(),
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(ROLE_VALUES).optional(),
  isActive: z.boolean().optional(),
  isApproved: z.boolean().optional(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(ROLE_VALUES).optional(),
});
