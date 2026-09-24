import { Schema, model, type Document, Types } from 'mongoose';
import {
  OFFER_DISCOUNT_TYPE,
  OFFER_SCOPE,
  OFFER_TAGS,
  type OfferDiscountType,
  type OfferScope,
  type OfferTag,
  type Role,
} from '@shopswift/shared';
import { applyToJSON } from '../utils/toJSON';

export interface IOffer extends Document {
  code: string;
  description: string;
  discountType: OfferDiscountType;
  discountValue: number;
  scope: OfferScope;
  team?: Types.ObjectId | null;
  minOrderValue: number;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usageLimitPerUser: number;
  usedCount: number;
  startsAt: Date;
  expiresAt: Date;
  isActive: boolean;
  tag?: OfferTag;
  createdBy: Types.ObjectId;
  createdByRole: Role;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    code: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    discountType: { type: String, enum: Object.values(OFFER_DISCOUNT_TYPE), required: true },
    discountValue: { type: Number, required: true, min: 0 },
    scope: { type: String, enum: Object.values(OFFER_SCOPE), required: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team', default: null, index: true },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, default: null },
    usageLimit: { type: Number, default: null, min: 1 },
    usageLimitPerUser: { type: Number, default: 1, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    tag: { type: String, enum: OFFER_TAGS },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdByRole: { type: String, required: true },
  },
  { timestamps: true },
);

offerSchema.pre('validate', function (next) {
  if (this.scope === OFFER_SCOPE.TEAM && !this.team) {
    this.invalidate('team', 'team is required when scope is "team"');
  }
  if (this.discountType === OFFER_DISCOUNT_TYPE.PERCENT && this.discountValue > 100) {
    this.invalidate('discountValue', 'percent discount cannot exceed 100');
  }
  if (this.expiresAt <= this.startsAt) {
    this.invalidate('expiresAt', 'expiresAt must be after startsAt');
  }
  next();
});

applyToJSON(offerSchema);

export const Offer = model<IOffer>('Offer', offerSchema);
