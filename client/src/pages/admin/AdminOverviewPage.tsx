import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useGetOverviewQuery, useGetSalesByTeamQuery } from '../../features/admin/adminApi';
import { StatCard } from '../../components/StatCard';
import { PageSpinner } from '../../components/Spinner';
import { formatMoney } from '../../lib/format';

export default function AdminOverviewPage() {
  const { data: overview, isLoading } = useGetOverviewQuery();
  const { data: salesByTeam } = useGetSalesByTeamQuery();

  if (isLoading) return <PageSpinner />;
  const kpis = overview?.data;

  const chartData = (salesByTeam?.data ?? []).map((row) => ({
    name: row.team.name.split(' ')[0],
    revenue: row.revenue / 100,
    color: row.team.colorPrimary,
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Overview</h1>
      <p className="mt-1 text-sm text-white/50">Site-wide performance across every team.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatMoney(kpis?.totalRevenue ?? 0)} />
        <StatCard label="Total Orders" value={String(kpis?.totalOrders ?? 0)} />
        <StatCard label="Customers" value={String(kpis?.totalUsers ?? 0)} />
        <StatCard
          label="Race Teams"
          value={String(kpis?.totalRaceTeams ?? 0)}
          hint={kpis?.pendingRaceTeamApprovals ? `${kpis.pendingRaceTeamApprovals} pending approval` : undefined}
        />
      </div>

      <div className="card-surface mt-8 rounded-lg p-6">
        <h2 className="font-display text-lg font-bold text-white">Revenue by Team</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#ffffff60" fontSize={12} />
              <YAxis stroke="#ffffff60" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#16161D', border: '1px solid #ffffff20', borderRadius: 8 }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-surface mt-8 rounded-lg p-6">
        <h2 className="font-display text-lg font-bold text-white">Orders by Status</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {kpis &&
            Object.entries(kpis.ordersByStatus).map(([status, count]) => (
              <div key={status} className="min-w-24 rounded-md bg-white/5 px-4 py-3 text-center">
                <p className="font-display text-xl font-bold text-white">{count}</p>
                <p className="text-xs capitalize text-white/40">{status}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
