import { z } from 'zod';

const hexColor = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const driverSchema = z.object({
  name: z.string().trim().min(1),
  number: z.number().int().min(0).max(99),
  nationality: z.string().trim().min(1),
});

export const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase, alphanumeric and hyphens only'),
  nationality: z.string().trim().min(1),
  logoUrl: z.string().url().optional(),
  colorPrimary: z.string().regex(hexColor),
  colorSecondary: z.string().regex(hexColor),
  colorAccent: z.string().regex(hexColor),
  description: z.string().trim().max(2000).optional(),
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear()),
  principal: z.string().trim().optional(),
  drivers: z.array(driverSchema).optional().default([]),
});

export const updateTeamSchema = createTeamSchema.partial().extend({
  isActive: z.boolean().optional(),
});
