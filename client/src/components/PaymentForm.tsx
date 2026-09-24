import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set when Stripe Elements itself fails to initialize — almost always a bad/placeholder
  // publishable key (VITE_STRIPE_PUBLISHABLE_KEY), not a payment failure. Surfaced
  // separately from `error` so the message can point at the actual root cause.
  const [elementLoadError, setElementLoadError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message ?? 'Payment failed. Please try a different card.');
        return;
      }

      if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
        onSuccess();
        return; // leave `submitting` true — we're navigating away on success
      }

      setError('Payment was not completed. Please try again.');
    } catch {
      // confirmPayment can reject outright (not just resolve with `{ error }`) if Stripe
      // itself never finished initializing — the exact case a placeholder publishable
      // key produces. Without this catch, `submitting` stayed `true` forever and the
      // button was stuck on "Processing…" with no explanation.
      setError(
        'Payment could not be started. This usually means Stripe is misconfigured — see the note below.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        onLoadError={(e) =>
          setElementLoadError(
            e.error.message ||
              'Could not load the payment form. VITE_STRIPE_PUBLISHABLE_KEY in client/.env is likely missing or invalid.',
          )
        }
      />

      {elementLoadError ? (
        <div className="rounded-md border border-f1red/40 bg-f1red/10 p-3 text-sm text-f1red-light">
          <p className="font-semibold">Payment form could not load.</p>
          <p className="mt-1 text-white/70">{elementLoadError}</p>
          <p className="mt-2 text-xs text-white/50">
            Set a real Stripe <strong>test-mode publishable key</strong> (starts with{' '}
            <code className="font-mono">pk_test_</code>) as <code className="font-mono">VITE_STRIPE_PUBLISHABLE_KEY</code>{' '}
            in <code className="font-mono">client/.env</code>, then restart the frontend dev server.
          </p>
        </div>
      ) : (
        <p className="text-xs text-white/30">
          Test mode — use card <span className="font-mono">4242 4242 4242 4242</span>, any future expiry, any CVC.
        </p>
      )}

      {error && <p className="text-sm text-f1red-light">{error}</p>}

      <button type="submit" disabled={!stripe || submitting || !!elementLoadError} className="btn-primary w-full">
        {submitting ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  );
}
