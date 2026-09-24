import { useParams } from 'react-router-dom';
import { useGetTeamQuery } from '../features/teams/teamsApi';
import { useListProductsQuery } from '../features/products/productsApi';
import { useListActiveOffersForTeamQuery } from '../features/offers/offersApi';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { PageSpinner } from '../components/Spinner';
import { useCartActions } from '../features/cart/useCartActions';
import { teamStyleVars } from '../lib/teamTheme';

export default function TeamDetailPage() {
  const { slug = '' } = useParams();
  const { data: teamRes, isLoading: teamLoading } = useGetTeamQuery(slug);
  const { data: productsRes, isLoading: productsLoading } = useListProductsQuery({ team: slug, limit: 24 });
  const { data: offersRes } = useListActiveOffersForTeamQuery(slug);
  const { addItem } = useCartActions();

  if (teamLoading) return <PageSpinner />;
  const team = teamRes?.data;
  if (!team) return <EmptyState title="Team not found" />;

  return (
    <div style={teamStyleVars(team)}>
      <div
        className="relative border-b border-white/5 bg-gradient-to-b from-base-850 to-base-900 py-16"
        style={{ backgroundImage: `linear-gradient(180deg, ${team.colorPrimary}22, transparent 70%)` }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-team">
            {team.nationality} · Est. {team.foundedYear}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white sm:text-5xl">{team.name}</h1>
          {team.description && <p className="mt-4 max-w-2xl text-white/60">{team.description}</p>}
          {team.drivers.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {team.drivers.map((driver) => (
                <div
                  key={driver.number}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 py-1.5 pl-1.5 pr-4"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-team font-display text-xs font-bold text-white">
                    {driver.number}
                  </span>
                  <span className="text-sm font-medium text-white">{driver.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6">
        {offersRes && offersRes.data.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {offersRes.data.map((offer) => (
              <div
                key={offer.id}
                className="rounded-md border border-team/40 bg-team/10 px-4 py-2 text-sm text-white"
              >
                <span className="font-mono font-semibold">{offer.code}</span> — {offer.description}
              </div>
            ))}
          </div>
        )}

        <div>
          <h2 className="mb-6 font-display text-2xl font-bold text-white">{team.name} Merchandise</h2>
          {productsLoading ? (
            <PageSpinner />
          ) : productsRes && productsRes.data.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {productsRes.data.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={() => addItem(product)} />
              ))}
            </div>
          ) : (
            <EmptyState title="No products yet" description="This team hasn't listed any merchandise yet." />
          )}
        </div>
      </div>
    </div>
  );
}
