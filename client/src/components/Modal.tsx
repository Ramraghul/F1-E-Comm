import type { ReactNode } from 'react';

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    // Always mounted; open/close is driven by plain CSS transitions, not framer-motion's
    // `animate` prop — see CartDrawer.tsx for why that proved unreliable (the transform/
    // opacity could get stuck mid-animation when the close happened alongside other
    // state updates in the same tick, e.g. a route change).
    <>
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-[90] flex items-center justify-center p-4 ${open ? '' : 'pointer-events-none'}`}
      >
        <div
          className={`max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-white/10 bg-base-850 p-6 shadow-2xl transition-all duration-200 ${
            open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.96] opacity-0'
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">{title}</h2>
            <button type="button" onClick={onClose} className="rounded p-1 text-white/50 hover:bg-white/5 hover:text-white">
              ✕
            </button>
          </div>
          {open && children}
        </div>
      </div>
    </>
  );
}
