import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useListAllOrdersQuery, useUpdateOrderStatusMutation } from '../../features/orders/ordersApi';
import { PageSpinner } from '../../components/Spinner';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { formatDate, formatMoney } from '../../lib/format';
import { apiErrorMessage, useToast } from '../../features/ui/useToast';
import { ORDER_STATUS_TRANSITIONS, type OrderStatus } from '@shopswift/shared';

const ALL_STATUSES: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListAllOrdersQuery({ page, limit: 20, status: status || undefined });
  const [updateStatus] = useUpdateOrderStatusMutation();
  const toast = useToast();

  async function handleStatusChange(id: string, next: string) {
    try {
      await updateStatus({ id, status: next }).unwrap();
      toast('Order status updated', 'success');
    } catch (err) {
      toast(apiErrorMessage(err, 'Could not update status'), 'error');
    }
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">All Orders</h1>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input-field w-auto"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data?.data.map((order) => {
              const nextOptions = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
              return (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-mono text-xs text-white">
                    <Link to={`/account/orders/${order.id}`} className="hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white/60">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-white/60">{formatMoney(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    {nextOptions.length > 0 ? (
                      <select
                        defaultValue=""
                        onChange={(e) => e.target.value && handleStatusChange(order.id, e.target.value)}
                        className="input-field w-auto py-1 text-xs"
                      >
                        <option value="" disabled>
                          Move to…
                        </option>
                        {nextOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-white/20">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline px-3 py-1.5 text-xs disabled:opacity-30">
            Prev
          </button>
          <span className="px-2 text-xs text-white/40">
            {data.pagination.page} / {data.pagination.totalPages}
          </span>
          <button disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-outline px-3 py-1.5 text-xs disabled:opacity-30">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
