import { Link } from 'react-router-dom';
import { useCartSummary } from '../features/cart/useCartSummary';
import { useCartActions } from '../features/cart/useCartActions';
import { formatMoney } from '../lib/format';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, subtotal } = useCartSummary();
  const { updateQuantity, removeItem } = useCartActions();

  return (
    // Always mounted; open/close is driven by plain CSS transitions (translate-x /
    // opacity classes), not a JS animation library's `animate` prop. That was tried
    // first and proved unreliable specifically when the close fires at the same time
    // as a route navigation (e.g. clicking "View Cart"/"Checkout") — the framer-motion
    // transform would sometimes never reach its closed value even though React's
    // `open` state (and pointer-events) updated correctly. A CSS transition keyed
    // directly off a class name has no such reconciliation race.
    <>
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-base-900 transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-white">Your Cart</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-white/60 hover:bg-white/5 hover:text-white"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="mt-10 text-center text-sm text-white/40">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li key={line.productId} className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-base-800">
                    {line.image && <img src={line.image} alt={line.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-white">{line.name}</p>
                    <p className="text-xs text-white/40">{line.team.name}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex items-center rounded border border-white/10">
                        <button
                          type="button"
                          className="px-2 py-0.5 text-white/70 hover:text-white"
                          onClick={() => updateQuantity(line.productId, Math.max(1, line.quantity - 1))}
                        >
                          −
                        </button>
                        <span className="px-2 text-xs text-white">{line.quantity}</span>
                        <button
                          type="button"
                          className="px-2 py-0.5 text-white/70 hover:text-white disabled:opacity-30"
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
                  <p className="font-display text-sm font-semibold text-white">
                    {formatMoney(line.price * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-white/10 px-5 py-4">
            <div className="mb-3 flex items-center justify-between font-display text-sm font-semibold text-white">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <Link to="/cart" onClick={onClose} className="btn-outline mb-2 block w-full">
              View Cart
            </Link>
            <Link to="/checkout" onClick={onClose} className="btn-primary block w-full">
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
