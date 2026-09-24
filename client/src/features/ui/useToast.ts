import { useCallback } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { toastAdded, type Toast } from './uiSlice';

export function useToast() {
  const dispatch = useAppDispatch();
  return useCallback(
    (message: string, type: Toast['type'] = 'info') => dispatch(toastAdded(message, type)),
    [dispatch],
  );
}

/** Extracts a readable message from an RTK Query error shape. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return fallback;
}
