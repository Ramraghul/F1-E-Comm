import { useCallback } from 'react';
import { useAuth } from '../auth/useAuth';
import { useAppDispatch } from '../../app/hooks';
import { itemAdded, quantityUpdated, itemRemoved, cartCleared } from './cartSlice';
import { useAddCartItemMutation, useUpdateCartItemMutation, useRemoveCartItemMutation, useClearCartMutation } from './cartApi';
import { useToast, apiErrorMessage } from '../ui/useToast';
import type { ProductDTO } from '@shopswift/shared';

export function useCartActions() {
  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [addServerItem] = useAddCartItemMutation();
  const [updateServerItem] = useUpdateCartItemMutation();
  const [removeServerItem] = useRemoveCartItemMutation();
  const [clearServerCart] = useClearCartMutation();

  const addItem = useCallback(
    async (product: ProductDTO, quantity = 1) => {
      if (isAuthenticated) {
        try {
          await addServerItem({ productId: product.id, quantity }).unwrap();
        } catch (err) {
          toast(apiErrorMessage(err, 'Could not add item to cart'), 'error');
          return;
        }
      } else {
        const team = typeof product.team === 'object' ? product.team : null;
        dispatch(
          itemAdded({
            item: {
              productId: product.id,
              name: product.name,
              image: product.images[0] ?? '',
              price: product.price,
              stock: product.stock,
              team: team ? { id: team.id, slug: team.slug, name: team.name } : { id: '', slug: '', name: '' },
            },
            quantity,
          }),
        );
      }
      toast(`${product.name} added to cart`, 'success');
    },
    [isAuthenticated, addServerItem, dispatch, toast],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (isAuthenticated) {
        try {
          await updateServerItem({ productId, quantity }).unwrap();
        } catch (err) {
          toast(apiErrorMessage(err, 'Could not update quantity'), 'error');
        }
      } else {
        dispatch(quantityUpdated({ productId, quantity }));
      }
    },
    [isAuthenticated, updateServerItem, dispatch, toast],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (isAuthenticated) {
        await removeServerItem(productId).unwrap().catch(() => undefined);
      } else {
        dispatch(itemRemoved(productId));
      }
    },
    [isAuthenticated, removeServerItem, dispatch],
  );

  const clear = useCallback(async () => {
    if (isAuthenticated) {
      await clearServerCart().unwrap().catch(() => undefined);
    } else {
      dispatch(cartCleared());
    }
  }, [isAuthenticated, clearServerCart, dispatch]);

  return { addItem, updateQuantity, removeItem, clear };
}
