import { useListActiveOffersQuery } from '../features/offers/offersApi';
import { EmptyState } from '../components/EmptyState';
import { PageSpinner } from '../components/Spinner';
import { formatDate, formatMoney } from '../lib/format';

export default function OffersPage() {
  const { data, isLoading } = useListActiveOffersQuery();

  if (isLoading) return <PageSpinner />;
  const offers = data?.data ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">Current Offers</h1>
      <p className="mt-1 text-white/50">Site-wide coupon codes — apply one at checkout.</p>

      {offers.length === 0 ? (
        <EmptyState title="No active offers right now" description="Check back soon for the next race-weekend special." />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {offers.map((offer) => (
            <div key={offer.id} className="card-surface racing-stripe rounded-lg p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-bold text-f1red">{offer.code}</span>
                <span className="font-display text-sm font-bold text-white">
                  {offer.discountType === 'percent' ? `${offer.discountValue}% OFF` : `${formatMoney(offer.discountValue)} OFF`}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/60">{offer.description}</p>
              <p className="mt-3 text-xs text-white/30">
                {offer.minOrderValue > 0 && `Min. order ${formatMoney(offer.minOrderValue)} · `}
                Expires {formatDate(offer.expiresAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
