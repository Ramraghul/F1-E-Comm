jest.mock('../../src/config/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

import request from 'supertest';
import Stripe from 'stripe';
import { app } from '../utils/testApp';
import { bearer } from '../utils/auth';
import { stripe } from '../../src/config/stripe';
import {
  createTeam,
  createAdmin,
  createRaceTeamUser,
  createUser,
  createProduct,
  createOffer,
} from '../../src/seed/factories';
import { Product } from '../../src/models/Product.model';
import { Order } from '../../src/models/Order.model';
import { Offer } from '../../src/models/Offer.model';
import { OFFER_DISCOUNT_TYPE, ROLES } from '@shopswift/shared';

const ORDERS_URL = '/api/v1/orders';
const WEBHOOK_URL = '/api/v1/payments/webhook';

const mockedCreateIntent = stripe.paymentIntents.create as jest.Mock;
const mockedConstructEvent = stripe.webhooks.constructEvent as jest.Mock;

function shippingAddress() {
  return {
    label: 'Home',
    line1: '1 Main St',
    city: 'Metropolis',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
  };
}

beforeEach(() => {
  mockedCreateIntent.mockReset();
  mockedConstructEvent.mockReset();
  mockedCreateIntent.mockResolvedValue({
    id: `pi_${Math.random().toString(36).slice(2, 10)}`,
    client_secret: 'secret_abc',
  });
});

describe('POST /orders', () => {
  it('re-prices from live product data and ignores any client-supplied price fields', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id, { price: 4000, stock: 10 });

    const res = await request(app)
      .post(ORDERS_URL)
      .set('Authorization', bearer(buyer))
      .send({
        items: [{ productId: product.id, quantity: 2, price: 1 }], // "price" is not a real field — ignored
        shippingAddress: shippingAddress(),
      });

    expect(res.status).toBe(201);
    expect(res.body.data.order.itemsTotal).toBe(8000);
    expect(res.body.data.order.status).toBe('pending');
    expect(res.body.data.clientSecret).toBe('secret_abc');
  });

  it('returns 409 when the requested quantity exceeds stock', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id, { price: 1000, stock: 1 });

    const res = await request(app)
      .post(ORDERS_URL)
      .set('Authorization', bearer(buyer))
      .send({
        items: [{ productId: product.id, quantity: 5 }],
        shippingAddress: shippingAddress(),
      });

    expect(res.status).toBe(409);
  });

  it('returns 400 when items is empty', async () => {
    const buyer = await createUser();
    const res = await request(app)
      .post(ORDERS_URL)
      .set('Authorization', bearer(buyer))
      .send({ items: [], shippingAddress: shippingAddress() });
    expect(res.status).toBe(400);
  });

  it('applies a valid coupon, persists the appliedOffer snapshot, and increments usedCount', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id, { price: 10000, stock: 10 });
    const offer = await createOffer(admin.id, ROLES.ADMIN, {
      code: 'SAVE20',
      discountType: OFFER_DISCOUNT_TYPE.PERCENT,
      discountValue: 20,
      minOrderValue: 0,
    });

    const res = await request(app)
      .post(ORDERS_URL)
      .set('Authorization', bearer(buyer))
      .send({
        items: [{ productId: product.id, quantity: 1 }],
        shippingAddress: shippingAddress(),
        offerCode: 'save20', // lowercase, still matches
      });

    expect(res.status).toBe(201);
    expect(res.body.data.order.discountAmount).toBe(2000);
    expect(res.body.data.order.appliedOffer.code).toBe('SAVE20');

    const reloaded = await Offer.findById(offer.id);
    expect(reloaded!.usedCount).toBe(1);
  });

  it('rejects an invalid coupon code with 400 and does not create the order', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id, { price: 5000, stock: 10 });

    const res = await request(app)
      .post(ORDERS_URL)
      .set('Authorization', bearer(buyer))
      .send({
        items: [{ productId: product.id, quantity: 1 }],
        shippingAddress: shippingAddress(),
        offerCode: 'NOT-REAL',
      });

    expect(res.status).toBe(400);
    expect(mockedCreateIntent).not.toHaveBeenCalled();
  });

  it('returns a clean 400 (not a 500) when Stripe fails, and leaves no orphaned order or spent offer behind', async () => {
    // Regression test: previously an unhandled Stripe error (e.g. an invalid/placeholder
    // API key) crashed with a raw 500, and left a `pending` order — plus a redeemed
    // offer — permanently stuck in the database with no way to ever pay for it.
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id, { price: 4000, stock: 10 });
    const offer = await createOffer(admin.id, ROLES.ADMIN, { code: 'STRIPEFAIL', discountValue: 10 });

    mockedCreateIntent.mockRejectedValueOnce(
      new Stripe.errors.StripeAuthenticationError({
        message: 'Invalid API Key provided',
        type: 'StripeAuthenticationError',
      } as Stripe.RawErrorType),
    );

    const res = await request(app)
      .post(ORDERS_URL)
      .set('Authorization', bearer(buyer))
      .send({
        items: [{ productId: product.id, quantity: 1 }],
        shippingAddress: shippingAddress(),
        offerCode: 'STRIPEFAIL',
      });

    expect(res.status).toBe(400);
    expect(await Order.countDocuments({ user: buyer.id })).toBe(0);

    const reloadedOffer = await Offer.findById(offer.id);
    expect(reloadedOffer!.usedCount).toBe(0);
  });
});

describe('PATCH /orders/:id/cancel', () => {
  it('allows cancelling only while pending', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id, { price: 2000, stock: 5 });

    const createRes = await request(app)
      .post(ORDERS_URL)
      .set('Authorization', bearer(buyer))
      .send({ items: [{ productId: product.id, quantity: 1 }], shippingAddress: shippingAddress() });

    const orderId = createRes.body.data.order.id;
    const cancelRes = await request(app)
      .patch(`${ORDERS_URL}/${orderId}/cancel`)
      .set('Authorization', bearer(buyer));

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('cancelled');

    const secondCancelRes = await request(app)
      .patch(`${ORDERS_URL}/${orderId}/cancel`)
      .set('Authorization', bearer(buyer));
    expect(secondCancelRes.status).toBe(400);
  });
});

describe('POST /payments/webhook', () => {
  it('rejects an invalid signature with 400', async () => {
    mockedConstructEvent.mockImplementation(() => {
      throw new Error('signature mismatch');
    });

    const res = await request(app)
      .post(WEBHOOK_URL)
      .set('stripe-signature', 'bad-sig')
      .send({ foo: 'bar' });

    expect(res.status).toBe(400);
  });

  it('marks the matching order paid and decrements stock on payment_intent.succeeded, idempotently', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id, { price: 3000, stock: 10 });

    const piId = 'pi_webhook_test_1';
    mockedCreateIntent.mockResolvedValueOnce({ id: piId, client_secret: 'secret_xyz' });

    const createRes = await request(app)
      .post(ORDERS_URL)
      .set('Authorization', bearer(buyer))
      .send({ items: [{ productId: product.id, quantity: 2 }], shippingAddress: shippingAddress() });
    const orderId = createRes.body.data.order.id;

    const event = {
      id: 'evt_succeeded_1',
      type: 'payment_intent.succeeded',
      data: { object: { id: piId } },
    };
    mockedConstructEvent.mockReturnValue(event);

    await request(app).post(WEBHOOK_URL).set('stripe-signature', 'ok').send(event).expect(200);

    const productAfter = await Product.findById(product.id);
    expect(productAfter!.stock).toBe(8);

    const orderRes = await request(app)
      .get(`${ORDERS_URL}/${orderId}`)
      .set('Authorization', bearer(buyer));
    expect(orderRes.body.data.status).toBe('paid');

    // Same Stripe event delivered twice (Stripe's at-least-once guarantee) must not double-decrement.
    await request(app).post(WEBHOOK_URL).set('stripe-signature', 'ok').send(event).expect(200);
    const productAfterRetry = await Product.findById(product.id);
    expect(productAfterRetry!.stock).toBe(8);
  });

  it('marks the order failed and reverts offer usage on payment_intent.payment_failed', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id, { price: 3000, stock: 10 });
    await createOffer(admin.id, ROLES.ADMIN, { code: 'FAILTEST', discountValue: 10 });

    const piId = 'pi_webhook_test_2';
    mockedCreateIntent.mockResolvedValueOnce({ id: piId, client_secret: 'secret_fail' });

    await request(app)
      .post(ORDERS_URL)
      .set('Authorization', bearer(buyer))
      .send({
        items: [{ productId: product.id, quantity: 1 }],
        shippingAddress: shippingAddress(),
        offerCode: 'FAILTEST',
      })
      .expect(201);

    const offerAfterOrder = await Offer.findOne({ code: 'FAILTEST' });
    expect(offerAfterOrder!.usedCount).toBe(1);

    const event = {
      id: 'evt_failed_1',
      type: 'payment_intent.payment_failed',
      data: { object: { id: piId } },
    };
    mockedConstructEvent.mockReturnValue(event);

    await request(app).post(WEBHOOK_URL).set('stripe-signature', 'ok').send(event).expect(200);

    const offerAfterFail = await Offer.findOne({ code: 'FAILTEST' });
    expect(offerAfterFail!.usedCount).toBe(0);
  });
});

describe('PATCH /orders/:id/status', () => {
  it('rejects an illegal transition with 400', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id, { price: 1000, stock: 5 });

    const createRes = await request(app)
      .post(ORDERS_URL)
      .set('Authorization', bearer(buyer))
      .send({ items: [{ productId: product.id, quantity: 1 }], shippingAddress: shippingAddress() });
    const orderId = createRes.body.data.order.id;

    const res = await request(app)
      .patch(`${ORDERS_URL}/${orderId}/status`)
      .set('Authorization', bearer(admin))
      .send({ status: 'delivered' });

    expect(res.status).toBe(400);
  });

  it('restricts a raceteam to orders containing their own team\'s items', async () => {
    const teamA = await createTeam();
    const teamB = await createTeam();
    const admin = await createAdmin();
    const raceteamB = await createRaceTeamUser(teamB.id);
    const buyer = await createUser();
    const product = await createProduct(teamA.id, admin.id, { price: 1000, stock: 5 });

    const createRes = await request(app)
      .post(ORDERS_URL)
      .set('Authorization', bearer(buyer))
      .send({ items: [{ productId: product.id, quantity: 1 }], shippingAddress: shippingAddress() });
    const orderId = createRes.body.data.order.id;

    // Move it to `processing` first (admin), so there is a legal `shipped` transition to attempt.
    await request(app)
      .patch(`${ORDERS_URL}/${orderId}/status`)
      .set('Authorization', bearer(admin))
      .send({ status: 'paid' });
    await request(app)
      .patch(`${ORDERS_URL}/${orderId}/status`)
      .set('Authorization', bearer(admin))
      .send({ status: 'processing' });

    const res = await request(app)
      .patch(`${ORDERS_URL}/${orderId}/status`)
      .set('Authorization', bearer(raceteamB))
      .send({ status: 'shipped' });

    expect(res.status).toBe(403);
  });
});
