import type { OfferDiscountType, OfferScope, OfferTag } from '../constants/order-status';
import type { ID } from './common.types';

export interface OfferDTO {
  id: ID;
  code: string;
  description: string;
  discountType: OfferDiscountType;
  discountValue: number;
  scope: OfferScope;
  team?: ID | { id: ID; name: string; slug: string } | null;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerUser: number;
  usedCount: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  tag?: OfferTag;
  createdBy: ID;
}

export interface CreateOfferInput {
  code: string;
  description: string;
  discountType: OfferDiscountType;
  discountValue: number;
  scope: OfferScope;
  team?: ID; // required if scope === 'team'; forced to caller's team for raceteam role
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  startsAt: string;
  expiresAt: string;
  tag?: OfferTag;
}

export type UpdateOfferInput = Partial<CreateOfferInput> & { isActive?: boolean };

export interface OfferValidationResult {
  valid: boolean;
  reason?: string;
  offerId?: ID;
  code?: string;
  discountAmount: number;
  eligibleSubtotal?: number;
}
