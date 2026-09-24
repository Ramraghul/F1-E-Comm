import { useState } from 'react';
import { useListMyOffersQuery, useCreateOfferMutation, useDeleteOfferMutation } from '../../features/offers/offersApi';
import { PageSpinner } from '../../components/Spinner';
import { Modal } from '../../components/Modal';
import { OfferForm } from '../../components/OfferForm';
import { EmptyState } from '../../components/EmptyState';
import { formatDate, formatMoney } from '../../lib/format';
import { apiErrorMessage, useToast } from '../../features/ui/useToast';

export default function RaceTeamOffersPage() {
  const { data, isLoading } = useListMyOffersQuery();
  const [createOffer, { isLoading: creating }] = useCreateOfferMutation();
  const [deleteOffer] = useDeleteOfferMutation();
  const [open, setOpen] = useState(false);
  const toast = useToast();

  async function handleSubmit(values: Parameters<typeof createOffer>[0]) {
    try {
      await createOffer(values).unwrap();
      toast('Offer created', 'success');
      setOpen(false);
    } catch (err) {
      toast(apiErrorMessage(err, 'Could not create offer'), 'error');
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Deactivate this offer?')) return;
    await deleteOffer(id).unwrap().catch((err) => toast(apiErrorMessage(err), 'error'));
  }

  if (isLoading) return <PageSpinner />;
  const offers = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">My Offers</h1>
        <button type="button" onClick={() => setOpen(true)} className="btn-team px-4 py-2 text-xs">
          + New Offer
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No offers yet" description="Create a coupon to drive sales for your team's store." />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {offers.map((offer) => (
            <div key={offer.id} className="card-surface rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white">{offer.code}</span>
                <span className={offer.isActive ? 'text-xs text-emerald-400' : 'text-xs text-white/30'}>
                  {offer.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-1 text-sm text-white/60">{offer.description}</p>
              <p className="mt-2 text-xs text-white/40">
                {offer.discountType === 'percent' ? `${offer.discountValue}% off` : `${formatMoney(offer.discountValue)} off`} · Used{' '}
                {offer.usedCount}
                {offer.usageLimit ? `/${offer.usageLimit}` : ''} · Expires {formatDate(offer.expiresAt)}
              </p>
              {offer.isActive && (
                <button type="button" onClick={() => handleDeactivate(offer.id)} className="mt-2 text-xs text-f1red-light hover:underline">
                  Deactivate
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Team Offer">
        <OfferForm lockedToTeam submitting={creating} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
