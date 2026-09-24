import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { OfferDTO } from '@shopswift/shared';

function getRemaining(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { diff, days, hours, minutes, seconds };
}

function Digit({ value }: { value: number }) {
  return (
    <span className="inline-flex min-w-[2.2ch] justify-center rounded bg-black/40 px-1.5 py-1 font-display text-lg font-bold tabular-nums text-white sm:text-2xl">
      {String(value).padStart(2, '0')}
    </span>
  );
}

export function CountdownBanner({ offer }: { offer: OfferDTO }) {
  const [remaining, setRemaining] = useState(() => getRemaining(offer.expiresAt));

  useEffect(() => {
    const timer = setInterval(() => setRemaining(getRemaining(offer.expiresAt)), 1000);
    return () => clearInterval(timer);
  }, [offer.expiresAt]);

  if (remaining.diff <= 0) return null;

  return (
    <div className="racing-stripe relative overflow-hidden rounded-lg bg-gradient-to-r from-f1red-dark via-f1red to-f1red-dark p-5 shadow-glow">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-white/80">
            {offer.tag === 'flash-sale' ? 'Flash Sale' : offer.tag === 'race-weekend' ? 'Race Weekend Special' : 'Limited-Time Offer'}
          </p>
          <p className="font-display text-xl font-bold text-white sm:text-2xl">{offer.description}</p>
          <p className="mt-1 font-mono text-sm font-semibold text-white/90">
            Use code <span className="rounded bg-black/30 px-1.5 py-0.5">{offer.code}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Digit value={remaining.days} />
          <span className="font-display text-white/60">:</span>
          <Digit value={remaining.hours} />
          <span className="font-display text-white/60">:</span>
          <Digit value={remaining.minutes} />
          <span className="font-display text-white/60">:</span>
          <Digit value={remaining.seconds} />
        </div>
        <Link to="/products" className="btn-outline whitespace-nowrap !border-white/40 bg-black/20">
          Shop Now
        </Link>
      </div>
    </div>
  );
}
