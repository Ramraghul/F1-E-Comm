import { Link, useParams } from 'react-router-dom';
import { useGetOrderQuery, useCancelOrderMutation } from '../features/orders/ordersApi';
import { PageSpinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { formatDateTime, formatMoney } from '../lib/format';
import { apiErrorMessage, useToast } from '../features/ui/useToast';

export default function AccountOrderDetailPage() {
  const { id = '' } = useParams();
  const { data, isLoading } = useGetOrderQuery(id);
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();
  const toast = useToast();

  if (isLoading) return <PageSpinner />;
  const order = data?.data;
  if (!order) return <EmptyState title="Order not found" />;

  async function handleCancel() {
    try {
      await cancelOrder(id).unwrap();
      toast('Order cancelled', 'success');
    } catch (err) {
      toast(apiErrorMessage(err, 'Could not cancel order'), 'error');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link to="/account/orders" className="text-sm text-white/40 hover:text-white">
        ← Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold text-white">{order.orderNumber}</h1>
          <p className="text-xs text-white/40">{formatDateTime(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="card-surface mt-6 rounded-lg p-6">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white/50">Items</h2>
        <ul className="mt-3 divide-y divide-white/5">
          {order.items.map((item) => (
            <li key={item.product} className="flex items-center gap-3 py-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-base-800">
                {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{item.name}</p>
                <p className="text-xs text-white/40">Qty {item.quantity}</p>
              </div>
              <span className="font-display text-sm font-semibold text-white">{formatMoney(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between text-white/60">
            <span>Subtotal</span>
            <span>{formatMoney(order.itemsTotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount {order.appliedOffer && `(${order.appliedOffer.code})`}</span>
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

      <div className="card-surface mt-6 rounded-lg p-6">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white/50">Shipping Address</h2>
        <p className="mt-2 text-sm text-white/70">
          {order.shippingAddress.line1}
          {order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`}
          <br />
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          <br />
          {order.shippingAddress.country}
        </p>
      </div>

      {order.status === 'pending' && (
        <button type="button" onClick={handleCancel} disabled={cancelling} className="btn-outline mt-6">
          {cancelling ? 'Cancelling…' : 'Cancel Order'}
        </button>
      )}
    </div>
  );
}
