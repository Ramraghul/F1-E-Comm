import { Schema, model, type Document, Types } from 'mongoose';
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  type OrderStatus,
  type PaymentStatus,
} from '@shopswift/shared';
import type { IAddress } from './User.model';
import { applyToJSON } from '../utils/toJSON';

export interface IOrderItem {
  product: Types.ObjectId;
  team: Types.ObjectId;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface IAppliedOffer {
  offer: Types.ObjectId;
  code: string;
  discountType: string;
  value: number;
  scope: string;
  team?: Types.ObjectId | null;
}

export interface IStatusHistoryEntry {
  status: OrderStatus;
  changedAt: Date;
  changedBy?: Types.ObjectId;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IAddress;
  itemsTotal: number;
  discountAmount: number;
  appliedOffer?: IAppliedOffer | null;
  shippingFee: number;
  totalAmount: number;
  paymentIntentId?: string;
  lastWebhookEventId?: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusHistory: IStatusHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const appliedOfferSchema = new Schema<IAppliedOffer>(
  {
    offer: { type: Schema.Types.ObjectId, ref: 'Offer', required: true },
    code: { type: String, required: true },
    discountType: { type: String, required: true },
    value: { type: Number, required: true },
    scope: { type: String, required: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
  },
  { _id: false },
);

const addressSubSchema = new Schema(
  {
    label: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false },
);

const statusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: { type: String, enum: Object.values(ORDER_STATUS), required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
    shippingAddress: { type: addressSubSchema, required: true },
    itemsTotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    appliedOffer: { type: appliedOfferSchema, default: null },
    shippingFee: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentIntentId: { type: String, index: true },
    lastWebhookEventId: { type: String },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  { timestamps: true },
);

orderSchema.index({ 'items.team': 1 });
orderSchema.index({ createdAt: -1 });

applyToJSON(orderSchema);

export const Order = model<IOrder>('Order', orderSchema);
