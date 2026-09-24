import { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useToast, apiErrorMessage } from '../ui/useToast';
import {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from './wishlistApi';

/** Wishlists are account-bound (no guest/localStorage version) — matches how most
 * real storefronts gate this feature, and keeps merge-on-login complexity out of a
 * "save for later" feature where losing a pre-login selection is low-stakes. */
export function useWishlist() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const { data, isLoading } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const [addMutation, { isLoading: adding }] = useAddToWishlistMutation();
  const [removeMutation, { isLoading: removing }] = useRemoveFromWishlistMutation();

  const productIds = useMemo(() => {
    const items = data?.data.items ?? [];
    return new Set(items.map((i) => (typeof i.product === 'string' ? i.product : i.product.id)));
  }, [data]);

  const isWishlisted = useCallback((productId: string) => productIds.has(productId), [productIds]);

  const toggle = useCallback(
    async (productId: string, productName?: string) => {
      if (!isAuthenticated) {
        toast('Log in to save items to your wishlist', 'info');
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
        return;
      }
      try {
        if (isWishlisted(productId)) {
          await removeMutation(productId).unwrap();
          toast(productName ? `${productName} removed from wishlist` : 'Removed from wishlist', 'info');
        } else {
          await addMutation(productId).unwrap();
          toast(productName ? `${productName} added to wishlist` : 'Added to wishlist', 'success');
        }
      } catch (err) {
        toast(apiErrorMessage(err, 'Could not update your wishlist'), 'error');
      }
    },
    [isAuthenticated, isWishlisted, addMutation, removeMutation, toast, navigate, location.pathname],
  );

  return {
    items: data?.data.items ?? [],
    count: data?.data.items.length ?? 0,
    isWishlisted,
    toggle,
    isLoading: isAuthenticated && isLoading,
    isMutating: adding || removing,
  };
}
