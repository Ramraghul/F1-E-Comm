export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

/** Allowed forward transitions for Order.status. Admin can apply any of these;
 * a Race Team may only apply transitions on orders containing its own line items,
 * and only from the `processing` family (see order.service.ts). */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const PRODUCT_CATEGORIES = [
  'apparel',
  'headwear',
  'model-cars',
  'accessories',
  'collectibles',
  'other',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const OFFER_DISCOUNT_TYPE = {
  PERCENT: 'percent',
  FLAT: 'flat',
} as const;
export type OfferDiscountType = (typeof OFFER_DISCOUNT_TYPE)[keyof typeof OFFER_DISCOUNT_TYPE];

export const OFFER_SCOPE = {
  GLOBAL: 'global',
  TEAM: 'team',
} as const;
export type OfferScope = (typeof OFFER_SCOPE)[keyof typeof OFFER_SCOPE];

export const OFFER_TAGS = ['flash-sale', 'race-weekend', 'seasonal', 'clearance'] as const;
export type OfferTag = (typeof OFFER_TAGS)[number];
