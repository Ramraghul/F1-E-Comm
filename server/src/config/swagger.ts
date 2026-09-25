import swaggerJSDoc from 'swagger-jsdoc';
import path from 'node:path';
import { env, isProd } from './env';

const isTs = __filename.endsWith('.ts');
const srcRoot = path.join(__dirname, '..');

const LOCAL_SERVER = { url: `http://localhost:${env.PORT}${env.API_PREFIX}`, description: 'Local' };
const PRODUCTION_SERVER = {
  url: `https://f1-e-comm.onrender.com${env.API_PREFIX}`,
  description: 'Production (Render)',
};
const CUSTOM_SERVER = {
  url: `{baseUrl}${env.API_PREFIX}`,
  description: 'Custom',
  variables: { baseUrl: { default: '' } },
};

// Swagger UI preselects the first entry, so lead with whichever one the running instance
// actually is — otherwise "Try it out" on the deployed docs fires at the visitor's localhost.
const servers = isProd
  ? [PRODUCTION_SERVER, LOCAL_SERVER, CUSTOM_SERVER]
  : [LOCAL_SERVER, PRODUCTION_SERVER, CUSTOM_SERVER];

const swaggerDefinition: swaggerJSDoc.OAS3Definition = {
  openapi: '3.0.3',
  info: {
    title: 'Shop Swift API',
    version: '1.0.0',
    description:
      'REST API for Shop Swift — an F1-themed multi-vendor e-commerce platform. ' +
      'Three roles: **user** (customer), **admin** (site-wide oversight), and ' +
      '**raceteam** (a self-service seller account scoped to one F1 constructor team). ' +
      'Endpoints that require a role state it explicitly in their description and via the ' +
      '`x-required-roles` extension field.',
    contact: { name: 'Shop Swift' },
    license: { name: 'MIT' },
  },
  servers,
  tags: [
    { name: 'Auth', description: 'Registration, login, token refresh, password reset' },
    { name: 'Users', description: 'Profile management and admin user management' },
    { name: 'Teams', description: 'F1 constructor teams' },
    { name: 'Products', description: 'Team merchandise catalog' },
    { name: 'Cart', description: 'Authenticated shopping cart' },
    { name: 'Wishlist', description: 'Authenticated saved-for-later product list' },
    { name: 'Offers', description: 'Coupons / discounts, global and team-scoped' },
    { name: 'Orders', description: 'Checkout, order history, fulfillment status' },
    { name: 'Payments', description: 'Stripe PaymentIntent + webhook' },
    { name: 'Reviews', description: 'Product reviews' },
    { name: 'Admin', description: 'Site-wide analytics and Race Team approval' },
    { name: 'RaceTeam', description: "A Race Team's own analytics dashboard" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token returned from /auth/login or /auth/refresh',
      },
    },
  },
  security: [],
};

export const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: [
    path.join(srcRoot, `routes/**/*.${isTs ? 'ts' : 'js'}`),
    path.join(srcRoot, `swagger/schemas/**/*.${isTs ? 'ts' : 'js'}`),
  ],
});
