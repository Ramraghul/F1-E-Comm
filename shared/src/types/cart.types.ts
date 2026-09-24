import type { ID } from './common.types';
import type { ProductDTO } from './product.types';

export interface CartItemDTO {
  product: ID | ProductDTO;
  quantity: number;
}

export interface CartDTO {
  id: ID;
  user: ID;
  items: CartItemDTO[];
}

/** Client-local cart line, used pre-checkout (guest cart in Redux/localStorage). */
export interface LocalCartItem {
  productId: ID;
  name: string;
  image: string;
  price: number;
  team: { id: ID; slug: string; name: string };
  quantity: number;
  stock: number;
}
