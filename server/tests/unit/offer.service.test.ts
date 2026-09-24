import { validateAndPriceOffer } from '../../src/services/offer.service';
import { createTeam, createAdmin, createRaceTeamUser, createOffer, createUser } from '../../src/seed/factories';
import { OFFER_DISCOUNT_TYPE, OFFER_SCOPE, ROLES } from '@shopswift/shared';
import { Order } from '../../src/models/Order.model';

async function makeLine(teamId: string, unitPrice: number, quantity: number) {
  return {
    productId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    teamId,
    unitPrice,
    quantity,
  };
}

describe('offer.service.validateAndPriceOffer', () => {
  it('rejects an unknown code', async () => {
    const user = await createUser();
    const result = await validateAndPriceOffer([], 'DOES-NOT-EXIST', user.id);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/not found/i);
  });

  it('rejects an offer that has not started yet', async () => {
    const admin = await createAdmin();
    const offer = await createOffer(admin.id, ROLES.ADMIN, {
      code: 'FUTURE10',
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });
    const user = await createUser();
    const line = await makeLine('teamId', 10000, 1);

    const result = await validateAndPriceOffer([line], offer.code, user.id);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/not started/i);
  });

  it('rejects an expired offer', async () => {
    const admin = await createAdmin();
    const offer = await createOffer(admin.id, ROLES.ADMIN, {
      code: 'EXPIRED10',
      startsAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });
    const user = await createUser();
    const line = await makeLine('teamId', 10000, 1);

    const result = await validateAndPriceOffer([line], offer.code, user.id);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/expired/i);
  });

  it('rejects when the usage limit has been reached', async () => {
    const admin = await createAdmin();
    const offer = await createOffer(admin.id, ROLES.ADMIN, {
      code: 'MAXEDOUT',
      usageLimit: 5,
      usedCount: 5,
    });
    const user = await createUser();
    const line = await makeLine('teamId', 10000, 1);

    const result = await validateAndPriceOffer([line], offer.code, user.id);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/usage limit/i);
  });

  it('rejects when the calling user has already redeemed it usageLimitPerUser times', async () => {
    const admin = await createAdmin();
    const offer = await createOffer(admin.id, ROLES.ADMIN, {
      code: 'ONEPERUSER',
      usageLimitPerUser: 1,
    });
    const user = await createUser();

    await Order.create({
      orderNumber: 'SS-TEST-0001',
      user: user.id,
      items: [
        {
          product: '507f1f77bcf86cd799439011',
          team: '507f1f77bcf86cd799439012',
          name: 'x',
          image: '',
          unitPrice: 1000,
          quantity: 1,
          subtotal: 1000,
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
      itemsTotal: 1000,
      totalAmount: 1000,
      appliedOffer: {
        offer: offer._id,
        code: offer.code,
        discountType: offer.discountType,
        value: offer.discountValue,
        scope: offer.scope,
      },
    });

    const line = await makeLine('teamId', 10000, 1);
    const result = await validateAndPriceOffer([line], offer.code, user.id);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/already used/i);
  });

  it('is case-insensitive on the coupon code', async () => {
    const admin = await createAdmin();
    await createOffer(admin.id, ROLES.ADMIN, { code: 'SAVE10', discountValue: 10 });
    const user = await createUser();
    const line = await makeLine('teamId', 10000, 1);

    const result = await validateAndPriceOffer([line], 'save10', user.id);
    expect(result.valid).toBe(true);
  });

  it('enforces minOrderValue against the ELIGIBLE subtotal, not the whole cart', async () => {
    const team = await createTeam();
    const otherTeam = await createTeam();
    const raceteam = await createRaceTeamUser(team.id);
    const offer = await createOffer(raceteam.id, ROLES.RACETEAM, {
      code: 'TEAMMIN',
      scope: OFFER_SCOPE.TEAM,
      team: team.id,
      discountType: OFFER_DISCOUNT_TYPE.PERCENT,
      discountValue: 20,
      minOrderValue: 5000,
    });
    const user = await createUser();

    // Cart total is well above minOrderValue, but only $10 of it is this team's items.
    const lines = [await makeLine(team.id, 1000, 1), await makeLine(otherTeam.id, 20000, 1)];

    const result = await validateAndPriceOffer(lines, offer.code, user.id);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/minimum order value/i);
  });

  it('a team-scoped offer only discounts that team\'s line items in a mixed-team cart', async () => {
    const team = await createTeam();
    const otherTeam = await createTeam();
    const raceteam = await createRaceTeamUser(team.id);
    const offer = await createOffer(raceteam.id, ROLES.RACETEAM, {
      code: 'TEAMONLY',
      scope: OFFER_SCOPE.TEAM,
      team: team.id,
      discountType: OFFER_DISCOUNT_TYPE.PERCENT,
      discountValue: 50,
      minOrderValue: 0,
    });
    const user = await createUser();

    const lines = [await makeLine(team.id, 10000, 1), await makeLine(otherTeam.id, 10000, 1)];
    const result = await validateAndPriceOffer(lines, offer.code, user.id);

    expect(result.valid).toBe(true);
    expect(result.eligibleSubtotal).toBe(10000); // only the owning team's line
    expect(result.discountAmount).toBe(5000); // 50% of 10000, not of the full 20000 cart
  });

  it('caps a percent discount at maxDiscountAmount', async () => {
    const admin = await createAdmin();
    const offer = await createOffer(admin.id, ROLES.ADMIN, {
      code: 'BIGPERCENT',
      discountType: OFFER_DISCOUNT_TYPE.PERCENT,
      discountValue: 90,
      maxDiscountAmount: 1000,
      minOrderValue: 0,
    });
    const user = await createUser();
    const line = await makeLine('teamId', 100000, 1); // 90% would be 90000

    const result = await validateAndPriceOffer([line], offer.code, user.id);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(1000);
  });

  it('never lets a flat discount exceed the eligible subtotal (no negative total)', async () => {
    const admin = await createAdmin();
    const offer = await createOffer(admin.id, ROLES.ADMIN, {
      code: 'HUGEFLAT',
      discountType: OFFER_DISCOUNT_TYPE.FLAT,
      discountValue: 100000,
      minOrderValue: 0,
    });
    const user = await createUser();
    const line = await makeLine('teamId', 2000, 1);

    const result = await validateAndPriceOffer([line], offer.code, user.id);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(2000); // capped at the subtotal itself
  });
});
