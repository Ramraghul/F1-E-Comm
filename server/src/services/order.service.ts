import { Types } from 'mongoose';
import Stripe from 'stripe';
import { ORDER_STATUS, ROLES, type OrderStatus, ORDER_STATUS_TRANSITIONS } from '@shopswift/shared';
import { Product } from '../models/Product.model';
import { Order, type IOrder, type IOrderItem } from '../models/Order.model';
import type { IAddress } from '../models/User.model';
import { ApiError } from '../utils/ApiError';
import { generateOrderNumber } from '../utils/slugify';
import { stripe } from '../config/stripe';
import { validateAndPriceOffer, redeemOffer, revertOfferUsage } from './offer.service';
import type { AuthenticatedUser } from '../types/express';
import { toStripeApiError } from '../utils/stripeError';

export const SHIPPING_FEE_CENTS = 999;
export const FREE_SHIPPING_THRESHOLD_CENTS = 10000;

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  shippingAddress: IAddress;
  offerCode?: string;
}

export async function createOrder(userId: string, input: CreateOrderInput) {
  const productIds = input.items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const items: IOrderItem[] = input.items.map((line) => {
    const product = productMap.get(line.productId);
    if (!product || !product.isActive) {
      throw ApiError.badRequest(`Product ${line.productId} is not available`);
    }
    if (product.stock < line.quantity) {
      throw ApiError.conflict(`Insufficient stock for "${product.name}" (only ${product.stock} left)`);
    }
    return {
      product: product._id,
      team: product.team,
      name: product.name,
      image: product.images[0] ?? '',
      unitPrice: product.price,
      quantity: line.quantity,
      subtotal: product.price * line.quantity,
    };
  });

  const itemsTotal = items.reduce((sum, i) => sum + i.subtotal, 0);

  let discountAmount = 0;
  let appliedOffer: IOrder['appliedOffer'] = null;

  if (input.offerCode) {
    const result = await validateAndPriceOffer(
      items.map((i) => ({
        productId: i.product.toString(),
        teamId: i.team.toString(),
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
      input.offerCode,
      userId,
    );
    if (!result.valid || !result.offer) {
      throw ApiError.badRequest(result.reason ?? 'Offer could not be applied');
    }
    discountAmount = result.discountAmount;
    appliedOffer = {
      offer: result.offer._id,
      code: result.offer.code,
      discountType: result.offer.discountType,
      value: result.offer.discountValue,
      scope: result.offer.scope,
      team: result.offer.team ?? null,
    };
  }

  const afterDiscount = Math.max(itemsTotal - discountAmount, 0);
  const shippingFee = afterDiscount >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FEE_CENTS;
  const totalAmount = afterDiscount + shippingFee;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: userId,
    items,
    shippingAddress: input.shippingAddress,
    itemsTotal,
    discountAmount,
    appliedOffer,
    shippingFee,
    totalAmount,
    paymentStatus: 'unpaid',
    status: ORDER_STATUS.PENDING,
    statusHistory: [{ status: ORDER_STATUS.PENDING, changedAt: new Date() }],
  });

  if (appliedOffer) {
    await redeemOffer(appliedOffer.offer.toString());
  }

  let paymentIntent: Stripe.PaymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      automatic_payment_methods: { enabled: true },
    });
  } catch (err) {
    // The order (and any offer redemption) was already committed above — if Stripe
    // can't issue a PaymentIntent, undo both rather than leaving an orphaned `pending`
    // order the user can never actually pay for.
    await Order.deleteOne({ _id: order._id });
    if (appliedOffer) await revertOfferUsage(appliedOffer.offer.toString());
    throw toStripeApiError(err);
  }

  order.paymentIntentId = paymentIntent.id;
  await order.save();

  return { order, clientSecret: paymentIntent.client_secret };
}

function orderContainsTeam(order: IOrder, teamId: string): boolean {
  return order.items.some((i) => i.team.toString() === teamId);
}

/**
 * Applies a status transition, enforcing the allowed-transitions map and the
 * Race Team scoping rule (only their own team's orders, only fulfillment steps).
 */
export async function transitionOrderStatus(
  order: IOrder,
  nextStatus: OrderStatus,
  actor: AuthenticatedUser,
): Promise<IOrder> {
  const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw ApiError.badRequest(`Cannot transition order from "${order.status}" to "${nextStatus}"`);
  }

  if (actor.role === ROLES.RACETEAM) {
    const fulfillmentOnly: OrderStatus[] = [ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED];
    if (!fulfillmentOnly.includes(nextStatus)) {
      throw ApiError.forbidden('Race Team accounts may only advance fulfillment status');
    }
    if (!actor.team || !orderContainsTeam(order, actor.team)) {
      throw ApiError.forbidden('This order does not contain any of your team\'s items');
    }
  }

  order.status = nextStatus;
  order.statusHistory.push({
    status: nextStatus,
    changedAt: new Date(),
    changedBy: new Types.ObjectId(actor.id),
  });
  await order.save();
  return order;
}

export async function markOrderPaid(order: IOrder, stripeEventId: string): Promise<void> {
  if (order.paymentStatus === 'paid' || order.lastWebhookEventId === stripeEventId) {
    return; // already processed — idempotent
  }

  order.paymentStatus = 'paid';
  order.status = ORDER_STATUS.PAID;
  order.statusHistory.push({ status: ORDER_STATUS.PAID, changedAt: new Date() });
  order.lastWebhookEventId = stripeEventId;
  await order.save();

  await Promise.all(
    order.items.map((item) =>
      Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } }),
    ),
  );
}

export async function markOrderFailed(order: IOrder, stripeEventId: string): Promise<void> {
  if (order.paymentStatus !== 'unpaid' || order.lastWebhookEventId === stripeEventId) {
    return; // already processed — idempotent
  }

  order.paymentStatus = 'failed';
  order.lastWebhookEventId = stripeEventId;
  await order.save();

  if (order.appliedOffer) {
    await revertOfferUsage(order.appliedOffer.offer.toString());
  }
}
