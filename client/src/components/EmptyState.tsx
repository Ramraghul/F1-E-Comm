import type { ReactNode } from 'react';

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="card-surface flex flex-col items-center gap-2 rounded-lg px-6 py-16 text-center">
      <p className="font-display text-lg font-semibold text-white">{title}</p>
      {description && <p className="max-w-sm text-sm text-white/40">{description}</p>}
      {action}
    </div>
  );
}
