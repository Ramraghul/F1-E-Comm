import type { ID } from './common.types';
import type { ProductDTO } from './product.types';

export interface WishlistItemDTO {
  product: ID | ProductDTO;
  addedAt: string;
}

export interface WishlistDTO {
  id: ID;
  user: ID;
  items: WishlistItemDTO[];
}
