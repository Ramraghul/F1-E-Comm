import { useGetMyTeamAnalyticsQuery } from '../../features/raceteam/raceteamApi';
import { StatCard } from '../../components/StatCard';
import { PageSpinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import { formatMoney } from '../../lib/format';
import { useAuth } from '../../features/auth/useAuth';

export default function RaceTeamOverviewPage() {
  const { data, isLoading } = useGetMyTeamAnalyticsQuery();
  const { user } = useAuth();
  const teamName = typeof user?.team === 'object' && user.team ? user.team.name : 'Your Team';

  if (isLoading) return <PageSpinner />;
  const analytics = data?.data;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">{teamName} Dashboard</h1>
      <p className="mt-1 text-sm text-white/50">Sales performance for your store only.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Revenue" value={formatMoney(analytics?.revenue ?? 0)} />
        <StatCard label="Orders" value={String(analytics?.orderCount ?? 0)} />
        <StatCard label="Units Sold" value={String(analytics?.unitsSold ?? 0)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-surface rounded-lg p-6">
          <h2 className="font-display text-lg font-bold text-white">Top Products</h2>
          {analytics && analytics.topProducts.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {analytics.topProducts.map((p) => (
                <li key={p.productId} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{p.name}</span>
                  <span className="text-white">{p.unitsSold} sold · {formatMoney(p.revenue)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-white/40">No sales yet.</p>
          )}
        </div>

        <div className="card-surface rounded-lg p-6">
          <h2 className="font-display text-lg font-bold text-white">Low Stock Alerts</h2>
          {analytics && analytics.lowStockProducts.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {analytics.lowStockProducts.map((p) => (
                <li key={p.productId} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{p.name}</span>
                  <span className="font-semibold text-amber-400">{p.stock} left</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="All stocked up" description="No products below 5 units." />
          )}
        </div>
      </div>
    </div>
  );
}
