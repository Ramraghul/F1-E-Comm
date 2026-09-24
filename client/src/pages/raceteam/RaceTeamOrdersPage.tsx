import { useState } from 'react';
import { useListTeamOrdersQuery, useUpdateOrderStatusMutation } from '../../features/orders/ordersApi';
import { PageSpinner } from '../../components/Spinner';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { formatDate, formatMoney } from '../../lib/format';
import { apiErrorMessage, useToast } from '../../features/ui/useToast';

const FULFILLMENT_NEXT: Record<string, string | null> = {
  pending: null,
  paid: null,
  processing: 'shipped',
  shipped: 'delivered',
  delivered: null,
  cancelled: null,
};

export default function RaceTeamOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListTeamOrdersQuery({ page, limit: 20 });
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  const toast = useToast();

  async function handleAdvance(id: string, next: string) {
    try {
      await updateStatus({ id, status: next }).unwrap();
      toast(`Order marked ${next}`, 'success');
    } catch (err) {
      toast(apiErrorMessage(err, 'Could not update order'), 'error');
    }
  }

  if (isLoading) return <PageSpinner />;
  const orders = data?.data ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Orders With My Items</h1>
      <p className="mt-1 text-sm text-white/50">Advance fulfillment status once you&apos;ve packed and shipped an order.</p>

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No orders yet" description="Orders containing your team's products will show up here." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => {
                const next = FULFILLMENT_NEXT[order.status];
                return (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-mono text-xs text-white">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-white/60">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-white/60">{formatMoney(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {next && (
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => handleAdvance(order.id, next)}
                          className="btn-team px-3 py-1.5 text-xs"
                        >
                          Mark {next}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
