import Stripe from 'stripe';
import { ApiError } from './ApiError';
import { logger } from './logger';

/**
 * Converts a Stripe SDK error (most commonly an invalid/placeholder API key in local
 * dev) into a clean, actionable `ApiError` instead of letting it fall through to the
 * generic error handler as an opaque 500.
 */
export function toStripeApiError(err: unknown): ApiError {
  if (err instanceof Stripe.errors.StripeError) {
    logger.error('Stripe request failed', err.message);
    return ApiError.badRequest(
      'Payment could not be processed. If you are running this locally, make sure ' +
        'STRIPE_SECRET_KEY in server/.env is set to a real Stripe test-mode secret key.',
    );
  }
  return ApiError.internal('Payment could not be processed');
}
