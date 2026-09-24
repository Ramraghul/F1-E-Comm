import { Link } from 'react-router-dom';
import { useListMyOrdersQuery } from '../features/orders/ordersApi';
import { PageSpinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { formatDate, formatMoney } from '../lib/format';

export default function AccountOrdersPage() {
  const { data, isLoading } = useListMyOrdersQuery();

  if (isLoading) return <PageSpinner />;
  const orders = data?.data ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Once you place an order, it'll show up here."
          action={
            <Link to="/products" className="btn-primary mt-4">
              Start Shopping
            </Link>
          }
        />
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/account/orders/${order.id}`}
                className="card-surface flex flex-wrap items-center justify-between gap-3 rounded-lg p-4 transition hover:border-white/15"
              >
                <div>
                  <p className="font-mono text-sm text-white">{order.orderNumber}</p>
                  <p className="text-xs text-white/40">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display font-bold text-white">{formatMoney(order.totalAmount)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
