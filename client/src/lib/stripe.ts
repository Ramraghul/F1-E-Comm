import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  stripePromise ??= loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '');
  return stripePromise;
}
