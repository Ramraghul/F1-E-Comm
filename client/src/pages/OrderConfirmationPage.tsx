import { Link, useParams } from 'react-router-dom';
import { useGetOrderQuery } from '../features/orders/ordersApi';
import { PageSpinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { formatMoney } from '../lib/format';

export default function OrderConfirmationPage() {
  const { id = '' } = useParams();
  const { data, isLoading } = useGetOrderQuery(id, { pollingInterval: 3000 });

  if (isLoading) return <PageSpinner />;
  const order = data?.data;
  if (!order) return <EmptyState title="Order not found" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-400">
        ✓
      </div>
      <h1 className="font-display text-3xl font-bold text-white">
        {order.paymentStatus === 'paid' ? 'Order Confirmed!' : 'Payment Processing…'}
      </h1>
      <p className="mt-2 text-white/50">
        Order <span className="font-mono text-white">{order.orderNumber}</span>
      </p>

      <div className="card-surface mt-8 rounded-lg p-6 text-left">
        <ul className="divide-y divide-white/5">
          {order.items.map((item) => (
            <li key={item.product} className="flex justify-between py-2.5 text-sm">
              <span className="text-white/70">
                {item.name} <span className="text-white/30">× {item.quantity}</span>
              </span>
              <span className="text-white">{formatMoney(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-sm">
          <div className="flex justify-between text-white/60">
            <span>Subtotal</span>
            <span>{formatMoney(order.itemsTotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount ({order.appliedOffer?.code})</span>
              <span>-{formatMoney(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-white/60">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? 'Free' : formatMoney(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2 font-display text-base font-bold text-white">
            <span>Total</span>
            <span>{formatMoney(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link to="/account/orders" className="btn-outline">
          View My Orders
        </Link>
        <Link to="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
