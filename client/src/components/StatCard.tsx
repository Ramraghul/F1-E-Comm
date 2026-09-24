import type { ReactNode } from 'react';

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="card-surface racing-stripe rounded-lg p-5">
      <div className="flex items-start justify-between">
        <span className="font-display text-xs font-semibold uppercase tracking-wider text-white/50">
          {label}
        </span>
        {icon && <span className="text-white/30">{icon}</span>}
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-white/40">{hint}</p>}
    </div>
  );
}
