// Runs via Jest's `setupFiles`, before any test file (and therefore before
// `src/config/env.ts`) is imported, so these are in place for its zod validation.
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-not-for-production-use';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-not-for-production-use';
process.env.JWT_REFRESH_EXPIRES_IN = '30d';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.ENABLE_SWAGGER = 'false';
// MONGODB_URI is set per-test-run by tests/setup.ts once mongodb-memory-server starts.
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/shopswift-test-placeholder';
