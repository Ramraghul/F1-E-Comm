import { Schema, model, type Document, Types } from 'mongoose';
import { applyToJSON } from '../utils/toJSON';

export interface IWishlistItem {
  product: Types.ObjectId;
  addedAt: Date;
}

export interface IWishlist extends Document {
  user: Types.ObjectId;
  items: IWishlistItem[];
}

const wishlistItemSchema = new Schema<IWishlistItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const wishlistSchema = new Schema<IWishlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: { type: [wishlistItemSchema], default: [] },
  },
  { timestamps: true },
);

applyToJSON(wishlistSchema);

export const Wishlist = model<IWishlist>('Wishlist', wishlistSchema);
