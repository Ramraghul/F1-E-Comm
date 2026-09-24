import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default('/api/v1'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  ENABLE_SWAGGER: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_ACCESS_SECRET: z.string().min(10, 'JWT_ACCESS_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET is required'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),

  SEED_ADMIN_EMAIL: z.string().default('admin@shopswift.dev'),
  SEED_ADMIN_PASSWORD: z.string().default('Admin@12345'),
  SEED_RACETEAM_PASSWORD: z.string().default('RaceTeam@12345'),
  SEED_CUSTOMER_PASSWORD: z.string().default('Customer@12345'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
