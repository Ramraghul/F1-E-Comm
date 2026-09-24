import type { OrderStatus, PaymentStatus } from '../constants/order-status';
import type { Address } from './user.types';
import type { ID } from './common.types';

export interface OrderItemDTO {
  product: ID;
  team: ID;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface AppliedOfferSnapshot {
  offer: ID;
  code: string;
  discountType: string;
  value: number;
  scope: string;
  team?: ID | null;
}

export interface OrderDTO {
  id: ID;
  orderNumber: string;
  user: ID;
  items: OrderItemDTO[];
  shippingAddress: Address;
  itemsTotal: number;
  discountAmount: number;
  appliedOffer?: AppliedOfferSnapshot | null;
  shippingFee: number;
  totalAmount: number;
  paymentIntentId?: string;
  clientSecret?: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; changedAt: string; changedBy?: ID }[];
  createdAt: string;
}

export interface CreateOrderInput {
  items: { productId: ID; quantity: number }[];
  shippingAddress: Address;
  offerCode?: string;
}
