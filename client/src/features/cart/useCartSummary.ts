import { useMemo } from 'react';
import { useAuth } from '../auth/useAuth';
import { useAppSelector } from '../../app/hooks';
import { useGetCartQuery } from './cartApi';
import { selectGuestCartItems } from './cartSlice';
import type { ProductDTO } from '@shopswift/shared';

export interface CartLine {
  productId: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  quantity: number;
  team: { id: string; slug: string; name: string };
}

/** Normalizes the guest (localStorage) cart and the server cart into one shape for the UI. */
export function useCartSummary() {
  const { isAuthenticated } = useAuth();
  const guestItems = useAppSelector(selectGuestCartItems);
  const { data: serverCart, isFetching } = useGetCartQuery(undefined, { skip: !isAuthenticated });

  const lines: CartLine[] = useMemo(() => {
    if (isAuthenticated) {
      if (!serverCart) return [];
      return serverCart.data.items
        .filter((i): i is { product: ProductDTO; quantity: number } => typeof i.product === 'object')
        .map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          image: i.product.images[0] ?? '',
          price: i.product.price,
          stock: i.product.stock,
          quantity: i.quantity,
          team:
            typeof i.product.team === 'object'
              ? { id: i.product.team.id, slug: i.product.team.slug, name: i.product.team.name }
              : { id: '', slug: '', name: '' },
        }));
    }
    return guestItems.map((i) => ({
      productId: i.productId,
      name: i.name,
      image: i.image,
      price: i.price,
      stock: i.stock,
      quantity: i.quantity,
      team: i.team,
    }));
  }, [isAuthenticated, serverCart, guestItems]);

  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  return { lines, count, subtotal, isLoading: isAuthenticated && isFetching };
}
