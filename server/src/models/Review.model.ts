import { Schema, model, type Document, Types } from 'mongoose';
import { applyToJSON } from '../utils/toJSON';

export interface IReview extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true },
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

applyToJSON(reviewSchema);

export const Review = model<IReview>('Review', reviewSchema);
