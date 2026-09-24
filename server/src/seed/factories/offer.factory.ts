import { faker } from '@faker-js/faker';
import { OFFER_DISCOUNT_TYPE, OFFER_SCOPE, type Role } from '@shopswift/shared';
import { Offer, type IOffer } from '../../models/Offer.model';

export async function createOffer(
  createdBy: string,
  createdByRole: Role,
  overrides: Partial<Record<string, unknown>> = {},
): Promise<IOffer> {
  // `faker.date.recent`/`.soon` default to `refDate: now`, so unless overridden these are
  // guaranteed to straddle "now" (startsAt in the past, expiresAt in the future) — the offer
  // is always currently active. Anchoring `.soon` off `startsAt` instead would let it land
  // anywhere in [startsAt, startsAt+30d], which can still be in the past.
  const startsAt = (overrides.startsAt as Date) ?? faker.date.recent({ days: 5 });
  const expiresAt = (overrides.expiresAt as Date) ?? faker.date.soon({ days: 30 });

  return Offer.create({
    code: faker.string.alpha({ length: 8, casing: 'upper' }),
    description: faker.lorem.sentence(),
    discountType: faker.helpers.arrayElement(Object.values(OFFER_DISCOUNT_TYPE)),
    discountValue: faker.number.int({ min: 5, max: 30 }),
    scope: OFFER_SCOPE.GLOBAL,
    minOrderValue: 0,
    usageLimitPerUser: 1,
    startsAt,
    expiresAt,
    isActive: true,
    createdBy,
    createdByRole,
    ...overrides,
  });
}
