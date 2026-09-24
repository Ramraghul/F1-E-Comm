import { useEffect, useRef } from 'react';
import { useAuth } from '../auth/useAuth';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useMergeGuestCartMutation } from './cartApi';
import { cartCleared, selectGuestCartItems } from './cartSlice';

/** When a guest with local cart items logs in, folds those items into their server cart once. */
export function useMergeCartOnLogin(): void {
  const { isAuthenticated } = useAuth();
  const guestItems = useAppSelector(selectGuestCartItems);
  const dispatch = useAppDispatch();
  const [mergeGuestCart] = useMergeGuestCartMutation();
  const hasMerged = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || hasMerged.current || guestItems.length === 0) return;
    hasMerged.current = true;

    mergeGuestCart({
      items: guestItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    })
      .unwrap()
      .then(() => dispatch(cartCleared()))
      .catch(() => {
        hasMerged.current = false; // allow retry on next render if it failed
      });
  }, [isAuthenticated, guestItems, mergeGuestCart, dispatch]);
}
