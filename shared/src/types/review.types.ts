import type { ID } from './common.types';

export interface ReviewDTO {
  id: ID;
  product: ID;
  user: ID | { id: ID; name: string };
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface CreateReviewInput {
  rating: number;
  comment: string;
}
