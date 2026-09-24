import { Offer, type IOffer } from '../models/Offer.model';
import { Order } from '../models/Order.model';
import { OFFER_DISCOUNT_TYPE, OFFER_SCOPE } from '@shopswift/shared';

export interface OfferEligibleLine {
  productId: string;
  teamId: string;
  unitPrice: number;
  quantity: number;
}

export interface OfferValidationResult {
  valid: boolean;
  reason?: string;
  discountAmount: number;
  eligibleSubtotal: number;
  offer?: IOffer;
}

function lineSubtotal(line: OfferEligibleLine): number {
  return line.unitPrice * line.quantity;
}

/**
 * The single authoritative offers engine, used both by the `/offers/validate` preview
 * endpoint and (again, server-side) by order creation — callers must never trust a
 * client-supplied discount amount.
 */
export async function validateAndPriceOffer(
  lines: OfferEligibleLine[],
  code: string,
  userId: string,
): Promise<OfferValidationResult> {
  const offer = await Offer.findOne({ code: code.trim().toUpperCase() });

  if (!offer || !offer.isActive) {
    return { valid: false, reason: 'Offer code not found', discountAmount: 0, eligibleSubtotal: 0 };
  }

  const now = new Date();
  if (now < offer.startsAt) {
    return { valid: false, reason: 'This offer has not started yet', discountAmount: 0, eligibleSubtotal: 0 };
  }
  if (now > offer.expiresAt) {
    return { valid: false, reason: 'This offer has expired', discountAmount: 0, eligibleSubtotal: 0 };
  }

  if (offer.usageLimit != null && offer.usedCount >= offer.usageLimit) {
    return {
      valid: false,
      reason: 'This offer has reached its usage limit',
      discountAmount: 0,
      eligibleSubtotal: 0,
    };
  }

  const userRedemptions = await Order.countDocuments({
    user: userId,
    'appliedOffer.offer': offer._id,
    status: { $ne: 'cancelled' },
  });
  if (userRedemptions >= offer.usageLimitPerUser) {
    return {
      valid: false,
      reason: 'You have already used this offer the maximum number of times',
      discountAmount: 0,
      eligibleSubtotal: 0,
    };
  }

  const eligibleLines =
    offer.scope === OFFER_SCOPE.TEAM
      ? lines.filter((l) => l.teamId === offer.team?.toString())
      : lines;

  const eligibleSubtotal = eligibleLines.reduce((sum, l) => sum + lineSubtotal(l), 0);

  if (eligibleSubtotal <= 0) {
    return {
      valid: false,
      reason:
        offer.scope === OFFER_SCOPE.TEAM
          ? 'Your cart has no items from this offer\'s team'
          : 'Your cart is empty',
      discountAmount: 0,
      eligibleSubtotal: 0,
    };
  }

  if (eligibleSubtotal < offer.minOrderValue) {
    return {
      valid: false,
      reason: `A minimum order value of ${(offer.minOrderValue / 100).toFixed(2)} is required for this offer`,
      discountAmount: 0,
      eligibleSubtotal,
    };
  }

  let discountAmount: number;
  if (offer.discountType === OFFER_DISCOUNT_TYPE.PERCENT) {
    discountAmount = Math.floor((eligibleSubtotal * offer.discountValue) / 100);
    if (offer.maxDiscountAmount != null) {
      discountAmount = Math.min(discountAmount, offer.maxDiscountAmount);
    }
  } else {
    discountAmount = Math.min(offer.discountValue, eligibleSubtotal);
  }

  return { valid: true, discountAmount, eligibleSubtotal, offer };
}

export async function redeemOffer(offerId: string): Promise<void> {
  await Offer.updateOne({ _id: offerId }, { $inc: { usedCount: 1 } });
}

export async function revertOfferUsage(offerId: string): Promise<void> {
  await Offer.updateOne({ _id: offerId, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
}
