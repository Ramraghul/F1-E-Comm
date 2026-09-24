import { useState } from 'react';
import { useListAllOffersQuery, useCreateOfferMutation, useDeleteOfferMutation } from '../../features/offers/offersApi';
import { useListTeamsQuery } from '../../features/teams/teamsApi';
import { PageSpinner } from '../../components/Spinner';
import { Modal } from '../../components/Modal';
import { OfferForm } from '../../components/OfferForm';
import { formatDate, formatMoney } from '../../lib/format';
import { apiErrorMessage, useToast } from '../../features/ui/useToast';

export default function AdminOffersPage() {
  const { data, isLoading } = useListAllOffersQuery();
  const { data: teams } = useListTeamsQuery();
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">All Offers</h1>
        <button type="button" onClick={() => setOpen(true)} className="btn-primary px-4 py-2 text-xs">
          + New Offer
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data?.data.map((offer) => (
              <tr key={offer.id}>
                <td className="px-4 py-3 font-mono text-white">{offer.code}</td>
                <td className="px-4 py-3 text-white/60">
                  {offer.scope === 'global' ? 'Global' : typeof offer.team === 'object' && offer.team ? offer.team.name : 'Team'}
                </td>
                <td className="px-4 py-3 text-white/60">
                  {offer.discountType === 'percent' ? `${offer.discountValue}%` : formatMoney(offer.discountValue)}
                </td>
                <td className="px-4 py-3 text-white/60">
                  {offer.usedCount}
                  {offer.usageLimit ? ` / ${offer.usageLimit}` : ''}
                </td>
                <td className="px-4 py-3 text-white/60">{formatDate(offer.expiresAt)}</td>
                <td className="px-4 py-3">
                  <span className={offer.isActive ? 'text-emerald-400' : 'text-white/30'}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {offer.isActive && (
                    <button type="button" onClick={() => handleDeactivate(offer.id)} className="text-xs text-f1red-light hover:underline">
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Offer">
        <OfferForm teams={teams?.data} submitting={creating} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
