import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { useCartSummary } from '../features/cart/useCartSummary';
import { useCartActions } from '../features/cart/useCartActions';
import { useCreateOrderMutation } from '../features/orders/ordersApi';
import { useValidateOfferMutation } from '../features/offers/offersApi';
import { Stepper } from '../components/Stepper';
import { PaymentForm } from '../components/PaymentForm';
import { EmptyState } from '../components/EmptyState';
import { formatMoney } from '../lib/format';
import { apiErrorMessage, useToast } from '../features/ui/useToast';
import { getStripe } from '../lib/stripe';
import type { Address } from '@shopswift/shared';

const STEPS = ['Shipping', 'Review & Coupon', 'Payment'];
const SHIPPING_FEE_ESTIMATE = 999;
const FREE_SHIPPING_THRESHOLD = 10000;

const emptyAddress: Address = {
  label: 'Home',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'United States',
  isDefault: true,
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { lines, subtotal } = useCartSummary();
  const { clear } = useCartActions();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [offerCode, setOfferCode] = useState('');
  const [discount, setDiscount] = useState<{ amount: number; reason?: string; valid: boolean } | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [validateOffer, { isLoading: validating }] = useValidateOfferMutation();
  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();

  if (lines.length === 0 && !clientSecret) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState title="Your cart is empty" description="Add some items before checking out." />
      </div>
    );
  }

  async function handleApplyOffer() {
    if (!offerCode.trim()) return;
    try {
      const res = await validateOffer({ code: offerCode }).unwrap();
      setDiscount({ amount: res.data.discountAmount, reason: res.data.reason, valid: res.data.valid });
      if (!res.data.valid) toast(res.data.reason ?? 'Offer is not valid', 'error');
    } catch (err) {
      toast(apiErrorMessage(err, 'Could not validate offer'), 'error');
    }
  }

  async function handlePlaceOrder() {
    try {
      const res = await createOrder({
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        shippingAddress: address,
        offerCode: discount?.valid ? offerCode : undefined,
      }).unwrap();
      setClientSecret(res.data.clientSecret);
      setOrderId(res.data.order.id);
      setStep(3);
    } catch (err) {
      toast(apiErrorMessage(err, 'Could not create order'), 'error');
    }
  }

  async function handlePaymentSuccess() {
    await clear();
    toast('Payment received — thank you!', 'success');
    navigate(`/order-confirmation/${orderId}`);
  }

  const estimatedDiscount = discount?.valid ? discount.amount : 0;
  const afterDiscount = Math.max(subtotal - estimatedDiscount, 0);
  const shippingFee = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE_ESTIMATE;
  const total = afterDiscount + shippingFee;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">Checkout</h1>
      <div className="mt-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}
              className="card-surface space-y-4 rounded-lg p-6"
            >
              <h2 className="font-display text-lg font-bold text-white">Shipping Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Address Line 1" value={address.line1} onChange={(v) => setAddress({ ...address, line1: v })} required />
                <Field label="Address Line 2 (optional)" value={address.line2 ?? ''} onChange={(v) => setAddress({ ...address, line2: v })} />
                <Field label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} required />
                <Field label="State / Province" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} required />
                <Field label="Postal Code" value={address.postalCode} onChange={(v) => setAddress({ ...address, postalCode: v })} required />
                <Field label="Country" value={address.country} onChange={(v) => setAddress({ ...address, country: v })} required />
              </div>
              <button type="submit" className="btn-primary">
                Continue to Review
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="card-surface space-y-5 rounded-lg p-6">
              <h2 className="font-display text-lg font-bold text-white">Review Your Order</h2>
              <ul className="divide-y divide-white/5">
                {lines.map((line) => (
                  <li key={line.productId} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-white/70">
                      {line.name} <span className="text-white/30">× {line.quantity}</span>
                    </span>
                    <span className="text-white">{formatMoney(line.price * line.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div>
                <p className="label">Coupon Code</p>
                <div className="flex gap-2">
                  <input
                    value={offerCode}
                    onChange={(e) => {
                      setOfferCode(e.target.value);
                      setDiscount(null);
                    }}
                    placeholder="e.g. WELCOME10"
                    className="input-field"
                  />
                  <button type="button" onClick={handleApplyOffer} disabled={validating} className="btn-outline px-5">
                    {validating ? 'Checking…' : 'Apply'}
                  </button>
                </div>
                {discount && (
                  <p className={`mt-1.5 text-xs ${discount.valid ? 'text-emerald-400' : 'text-f1red-light'}`}>
                    {discount.valid ? `Discount applied: -${formatMoney(discount.amount)}` : discount.reason}
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="btn-outline">
                  Back
                </button>
                <button type="button" onClick={handlePlaceOrder} disabled={creatingOrder} className="btn-primary">
                  {creatingOrder ? 'Placing Order…' : 'Place Order & Pay'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && clientSecret && (
            <div className="card-surface rounded-lg p-6">
              <h2 className="mb-4 font-display text-lg font-bold text-white">Payment</h2>
              <Elements stripe={getStripe()} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <PaymentForm onSuccess={handlePaymentSuccess} />
              </Elements>
            </div>
          )}
        </div>

        <div className="card-surface h-fit rounded-lg p-5">
          <h2 className="font-display text-lg font-bold text-white">Order Total</h2>
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={formatMoney(subtotal)} />
            {estimatedDiscount > 0 && <Row label="Discount" value={`-${formatMoney(estimatedDiscount)}`} muted />}
            <Row label="Shipping" value={shippingFee === 0 ? 'Free' : formatMoney(shippingFee)} />
            <div className="border-t border-white/10 pt-2">
              <Row label="Total" value={formatMoney(total)} bold />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      />
    </label>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? 'text-emerald-400' : 'text-white/70'} ${bold ? 'font-display text-base font-bold text-white' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
