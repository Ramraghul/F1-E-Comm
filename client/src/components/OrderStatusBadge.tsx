const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  paid: 'bg-sky-500/15 text-sky-400',
  processing: 'bg-violet-500/15 text-violet-400',
  shipped: 'bg-blue-500/15 text-blue-400',
  delivered: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-white/10 text-white/40',
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-wide ${
        STATUS_STYLES[status] ?? 'bg-white/10 text-white/50'
      }`}
    >
      {status}
    </span>
  );
}
