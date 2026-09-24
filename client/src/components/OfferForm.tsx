import { useState } from 'react';
import { OFFER_TAGS, type OfferTag, type TeamDTO } from '@shopswift/shared';

export interface OfferFormSubmitValues {
  code: string;
  description: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  scope: 'global' | 'team';
  team?: string;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerUser: number;
  startsAt: string;
  expiresAt: string;
  tag?: OfferTag;
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 16);
}

export function OfferForm({
  teams,
  lockedToTeam,
  submitting,
  onSubmit,
}: {
  /** When provided, an admin can choose scope=team + pick a team. Omit for raceteam callers. */
  teams?: TeamDTO[];
  /** When true (raceteam context), scope/team fields are hidden — server forces them anyway. */
  lockedToTeam?: boolean;
  submitting?: boolean;
  onSubmit: (values: OfferFormSubmitValues) => void;
}) {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [discountValue, setDiscountValue] = useState(10);
  const [scope, setScope] = useState<'global' | 'team'>(lockedToTeam ? 'team' : 'global');
  const [team, setTeam] = useState('');
  const [minOrderValue, setMinOrderValue] = useState(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [usageLimitPerUser, setUsageLimitPerUser] = useState(1);
  const [startsAt, setStartsAt] = useState(toDateInputValue(new Date()));
  const [expiresAt, setExpiresAt] = useState(toDateInputValue(new Date(Date.now() + 14 * 86400000)));
  const [tag, setTag] = useState<OfferTag | ''>('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      code,
      description,
      discountType,
      discountValue,
      scope,
      team: scope === 'team' ? team || undefined : undefined,
      minOrderValue: Math.round(minOrderValue * 100),
      maxDiscountAmount: maxDiscountAmount ? Math.round(Number(maxDiscountAmount) * 100) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      usageLimitPerUser,
      startsAt: new Date(startsAt).toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      tag: tag || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input required placeholder="CODE (e.g. SAVE10)" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="input-field" />
        <select value={tag} onChange={(e) => setTag(e.target.value as OfferTag)} className="input-field">
          <option value="">No tag</option>
          {OFFER_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <input required placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" />

      {!lockedToTeam && teams && (
        <div className="grid grid-cols-2 gap-3">
          <select value={scope} onChange={(e) => setScope(e.target.value as 'global' | 'team')} className="input-field">
            <option value="global">Global (site-wide)</option>
            <option value="team">Team-scoped</option>
          </select>
          {scope === 'team' && (
            <select required value={team} onChange={(e) => setTeam(e.target.value)} className="input-field">
              <option value="" disabled>
                Select team…
              </option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <select value={discountType} onChange={(e) => setDiscountType(e.target.value as 'percent' | 'flat')} className="input-field">
          <option value="percent">Percent off</option>
          <option value="flat">Flat amount off</option>
        </select>
        <input
          required
          type="number"
          min={0}
          step={discountType === 'percent' ? 1 : 0.01}
          placeholder={discountType === 'percent' ? '% off' : '$ off'}
          value={discountValue}
          onChange={(e) => setDiscountValue(Number(e.target.value))}
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="label">Min Order ($)</span>
          <input type="number" min={0} step="0.01" value={minOrderValue} onChange={(e) => setMinOrderValue(Number(e.target.value))} className="input-field" />
        </label>
        <label className="block">
          <span className="label">Max Discount ($)</span>
          <input type="number" min={0} step="0.01" value={maxDiscountAmount} onChange={(e) => setMaxDiscountAmount(e.target.value)} className="input-field" placeholder="No cap" />
        </label>
        <label className="block">
          <span className="label">Uses / User</span>
          <input type="number" min={1} value={usageLimitPerUser} onChange={(e) => setUsageLimitPerUser(Number(e.target.value))} className="input-field" />
        </label>
      </div>

      <label className="block">
        <span className="label">Total Usage Limit</span>
        <input type="number" min={1} value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} className="input-field" placeholder="Unlimited" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="label">Starts</span>
          <input required type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="input-field" />
        </label>
        <label className="block">
          <span className="label">Expires</span>
          <input required type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="input-field" />
        </label>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Creating…' : 'Create Offer'}
      </button>
    </form>
  );
}
