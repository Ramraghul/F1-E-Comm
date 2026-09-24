import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { Order } from '../models/Order.model';
import { stripe } from '../config/stripe';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { logger } from '../utils/logger';
import { toStripeApiError } from '../utils/stripeError';
import * as orderService from '../services/order.service';

export const createOrRetryIntent = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.user.toString() !== req.user!.id) throw ApiError.forbidden('Not your order');
  if (order.paymentStatus === 'paid') throw ApiError.conflict('Order is already paid');

  let intent;
  try {
    intent = await stripe.paymentIntents.create({
      amount: order.totalAmount,
      currency: 'usd',
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      automatic_payment_methods: { enabled: true },
    });
  } catch (err) {
    throw toStripeApiError(err);
  }

  order.paymentIntentId = intent.id;
  await order.save();

  sendSuccess(res, 200, { clientSecret: intent.client_secret }, 'Payment intent created');
});

/**
 * Stripe webhook — the SOLE source of truth for payment state. Mounted with
 * `express.raw()` on this one route (before the global JSON parser) so the
 * signature can be verified against the exact raw request body.
 */
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];
  if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
    throw ApiError.badRequest('Missing Stripe signature or webhook secret not configured');
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    logger.error('Stripe webhook signature verification failed', err);
    throw ApiError.badRequest('Invalid Stripe webhook signature');
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent;
      const order = await Order.findOne({ paymentIntentId: intent.id });
      if (order) await orderService.markOrderPaid(order, event.id);
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      const order = await Order.findOne({ paymentIntentId: intent.id });
      if (order) await orderService.markOrderFailed(order, event.id);
      break;
    }
    default:
      break; // ignore other event types
  }

  res.json({ received: true });
});
