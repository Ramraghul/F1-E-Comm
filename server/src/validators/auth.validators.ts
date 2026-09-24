import { z } from 'zod';
import { objectIdSchema } from './common.validators';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: passwordSchema,
});

export const registerRaceTeamSchema = registerSchema.extend({
  teamId: objectIdSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordBodySchema = z.object({
  password: passwordSchema,
});

export const resetPasswordParamsSchema = z.object({
  token: z.string().min(10),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});
