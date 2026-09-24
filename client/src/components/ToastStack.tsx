import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { toastDismissed, type Toast } from '../features/ui/uiSlice';

const TYPE_STYLES: Record<string, string> = {
  success: 'border-emerald-500/40 bg-emerald-950/80',
  error: 'border-f1red/50 bg-red-950/80',
  info: 'border-white/15 bg-base-800/90',
};

function ToastItem({ id, type, message }: Toast) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(toastDismissed(id)), 4500);
    return () => clearTimeout(timer);
  }, [id, dispatch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40 }}
      className={`pointer-events-auto rounded-md border px-4 py-3 text-sm text-white shadow-lg backdrop-blur ${TYPE_STYLES[type] ?? TYPE_STYLES.info}`}
      onClick={() => dispatch(toastDismissed(id))}
    >
      {message}
    </motion.div>
  );
}

export function ToastStack() {
  const toasts = useAppSelector((s) => s.ui.toasts);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
