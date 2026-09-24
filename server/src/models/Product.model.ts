import { Schema, model, type Document, Types } from 'mongoose';
import { PRODUCT_CATEGORIES, type ProductCategory } from '@shopswift/shared';
import { applyToJSON } from '../utils/toJSON';

export interface IProduct extends Document {
  team: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
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
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, trim: true, lowercase: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true, index: true },
    price: { type: Number, required: true, min: 0 }, // integer cents
    currency: { type: String, default: 'USD' },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    images: { type: [String], default: [] },
    driverTag: { type: String, trim: true },
    sizes: { type: [String], default: undefined },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

productSchema.index({ team: 1, category: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ slug: 1, team: 1 }, { unique: true });

applyToJSON(productSchema);

export const Product = model<IProduct>('Product', productSchema);
