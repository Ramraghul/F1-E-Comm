import type { ProductCategory } from '../constants/order-status';
import type { ID } from './common.types';
import type { TeamDTO } from './team.types';

export interface ProductDTO {
  id: ID;
  team: ID | Pick<TeamDTO, 'id' | 'name' | 'slug' | 'colorPrimary'>;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  /** Integer minor currency units (cents). */
  price: number;
  currency: string;
  stock: number;
  sku: string;
  images: string[];
  driverTag?: string;
  sizes?: string[];
  isFeatured: boolean;
  isActive: boolean;
  ratingsAverage: number;
  ratingsCount: number;
  createdBy: ID;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  team?: ID; // ignored/forced server-side for raceteam callers
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
  sku: string;
  images: string[];
  driverTag?: string;
  sizes?: string[];
  isFeatured?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput> & { isActive?: boolean };

export interface ProductQuery {
  page?: number;
  limit?: number;
  team?: string;
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'featured';
}
