import { ORDER_STATUS, ROLES } from '@shopswift/shared';
import { transitionOrderStatus, markOrderPaid, markOrderFailed } from '../../src/services/order.service';
import { Order } from '../../src/models/Order.model';
import { Product } from '../../src/models/Product.model';
import {
  createTeam,
  createAdmin,
  createRaceTeamUser,
  createProduct,
  createUser,
  createOffer,
} from '../../src/seed/factories';

async function makeOrder(teamId: string, productId: string, overrides: Partial<Record<string, unknown>> = {}) {
  const buyer = await createUser();
  return Order.create({
    orderNumber: `SS-TEST-${Math.random().toString(36).slice(2, 8)}`,
    user: buyer.id,
    items: [
      {
        product: productId,
        team: teamId,
        name: 'Team Jacket',
        image: '',
        unitPrice: 5000,
        quantity: 1,
        subtotal: 5000,
      },
    ],
    shippingAddress: {
      label: 'Home',
      line1: '1 Main St',
      city: 'City',
      state: 'ST',
      postalCode: '00000',
      country: 'US',
    },
    itemsTotal: 5000,
    totalAmount: 5000,
    status: ORDER_STATUS.PENDING,
    paymentStatus: 'unpaid',
    ...overrides,
  });
}

describe('order.service.transitionOrderStatus', () => {
  it('allows pending -> paid for an admin', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const product = await createProduct(team.id, admin.id);
    const order = await makeOrder(team.id, product.id);

    const updated = await transitionOrderStatus(order, ORDER_STATUS.PAID, {
      id: admin.id,
      role: ROLES.ADMIN,
    });
    expect(updated.status).toBe(ORDER_STATUS.PAID);
  });

  it('rejects an illegal transition (pending -> delivered)', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const product = await createProduct(team.id, admin.id);
    const order = await makeOrder(team.id, product.id);

    await expect(
      transitionOrderStatus(order, ORDER_STATUS.DELIVERED, { id: admin.id, role: ROLES.ADMIN }),
    ).rejects.toThrow(/cannot transition/i);
  });

  it('lets a raceteam advance processing -> shipped only for orders containing their own items', async () => {
    const team = await createTeam();
    const raceteam = await createRaceTeamUser(team.id);
    const admin = await createAdmin();
    const product = await createProduct(team.id, admin.id);
    const order = await makeOrder(team.id, product.id, { status: ORDER_STATUS.PROCESSING });

    const updated = await transitionOrderStatus(order, ORDER_STATUS.SHIPPED, {
      id: raceteam.id,
      role: ROLES.RACETEAM,
      team: team.id,
    });
    expect(updated.status).toBe(ORDER_STATUS.SHIPPED);
  });

  it("blocks a raceteam from updating an order that doesn't contain their team's items", async () => {
    const team = await createTeam();
    const otherTeam = await createTeam();
    const raceteam = await createRaceTeamUser(otherTeam.id);
    const admin = await createAdmin();
    const product = await createProduct(team.id, admin.id);
    const order = await makeOrder(team.id, product.id, { status: ORDER_STATUS.PROCESSING });

    await expect(
      transitionOrderStatus(order, ORDER_STATUS.SHIPPED, {
        id: raceteam.id,
        role: ROLES.RACETEAM,
        team: otherTeam.id,
      }),
    ).rejects.toThrow(/your team/i);
  });

  it('blocks a raceteam from applying a non-fulfillment transition (e.g. pending -> paid)', async () => {
    const team = await createTeam();
    const raceteam = await createRaceTeamUser(team.id);
    const admin = await createAdmin();
    const product = await createProduct(team.id, admin.id);
    const order = await makeOrder(team.id, product.id, { status: ORDER_STATUS.PENDING });

    await expect(
      transitionOrderStatus(order, ORDER_STATUS.PAID, {
        id: raceteam.id,
        role: ROLES.RACETEAM,
        team: team.id,
      }),
    ).rejects.toThrow(/fulfillment/i);
  });
});

describe('order.service webhook handlers', () => {
  it('markOrderPaid decrements stock and is idempotent on Stripe event id', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const product = await createProduct(team.id, admin.id, { stock: 10 });
    const order = await makeOrder(team.id, product.id);
    order.items[0]!.quantity = 3;
    await order.save();

    await markOrderPaid(order, 'evt_123');
    const reloaded = await Product.findById(product.id);
    expect(reloaded!.stock).toBe(7);
    expect(order.status).toBe(ORDER_STATUS.PAID);
    expect(order.paymentStatus).toBe('paid');

    // Re-delivering the same Stripe event must not decrement stock again.
    await markOrderPaid(order, 'evt_123');
    const reloadedAgain = await Product.findById(product.id);
    expect(reloadedAgain!.stock).toBe(7);
  });

  it('markOrderFailed reverts offer usage and is idempotent', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const product = await createProduct(team.id, admin.id);
    const offer = await createOffer(admin.id, ROLES.ADMIN, { usedCount: 1 });
    const order = await makeOrder(team.id, product.id, {
      appliedOffer: {
        offer: offer._id,
        code: offer.code,
        discountType: offer.discountType,
        value: offer.discountValue,
        scope: offer.scope,
      },
    });

    await markOrderFailed(order, 'evt_456');
    expect(order.paymentStatus).toBe('failed');

    const { Offer } = await import('../../src/models/Offer.model');
    const reloaded = await Offer.findById(offer.id);
    expect(reloaded!.usedCount).toBe(0);

    await markOrderFailed(order, 'evt_456'); // idempotent no-op second time
    const reloadedAgain = await Offer.findById(offer.id);
    expect(reloadedAgain!.usedCount).toBe(0);
  });
});
