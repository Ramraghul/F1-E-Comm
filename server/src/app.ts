import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env, isTest } from './config/env';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { handleWebhook } from './controllers/payment.controller';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  // CSP is disabled because it otherwise blocks Swagger UI's inline scripts/styles
  // at GET /api-docs, which we deliberately keep enabled in production as a portfolio asset.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );

  // Stripe webhook needs the exact raw request body for signature verification,
  // so it's mounted here with express.raw(), ahead of the global express.json().
  app.post(
    `${env.API_PREFIX}/payments/webhook`,
    express.raw({ type: 'application/json' }),
    handleWebhook,
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(compression());

  if (!isTest) {
    app.use(morgan('dev'));
  }

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(env.API_PREFIX, apiLimiter);

  if (env.ENABLE_SWAGGER) {
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, { customSiteTitle: 'Shop Swift API Docs' }),
    );
    app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
  }

  app.use(env.API_PREFIX, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
