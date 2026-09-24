import { Link } from 'react-router-dom';
import { useCartSummary } from '../features/cart/useCartSummary';
import { useCartActions } from '../features/cart/useCartActions';
import { formatMoney } from '../lib/format';
import { EmptyState } from '../components/EmptyState';

export default function CartPage() {
  const { lines, subtotal, isLoading } = useCartSummary();
  const { updateQuantity, removeItem } = useCartActions();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">Your Cart</h1>

      {!isLoading && lines.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse the grid and find your next piece of team gear."
          action={
            <Link to="/products" className="btn-primary mt-4">
              Shop Products
            </Link>
          }
        />
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <ul className="space-y-4 md:col-span-2">
            {lines.map((line) => (
              <li key={line.productId} className="card-surface flex gap-4 rounded-lg p-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded bg-base-800">
                  {line.image && <img src={line.image} alt={line.name} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1">
                  <Link to={`/products/${line.productId}`} className="font-display font-semibold text-white hover:underline">
                    {line.name}
                  </Link>
                  <p className="text-xs text-white/40">{line.team.name}</p>
                  <p className="mt-1 font-display font-bold text-white">{formatMoney(line.price)}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded border border-white/10">
                      <button
                        type="button"
                        className="px-2.5 py-1 text-white/70 hover:text-white"
                        onClick={() => updateQuantity(line.productId, Math.max(1, line.quantity - 1))}
                      >
                        −
                      </button>
                      <span className="px-3 text-sm text-white">{line.quantity}</span>
                      <button
                        type="button"
                        className="px-2.5 py-1 text-white/70 hover:text-white disabled:opacity-30"
                        disabled={line.quantity >= line.stock}
                        onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(line.productId)}
                      className="text-xs text-white/40 hover:text-f1red-light"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="font-display font-bold text-white">{formatMoney(line.price * line.quantity)}</p>
              </li>
            ))}
          </ul>

          <div className="card-surface h-fit rounded-lg p-5">
            <h2 className="font-display text-lg font-bold text-white">Order Summary</h2>
            <div className="mt-4 flex justify-between text-sm text-white/60">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-white/30">Coupons and shipping are calculated at checkout.</p>
            <Link to="/checkout" className="btn-primary mt-5 block w-full">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
