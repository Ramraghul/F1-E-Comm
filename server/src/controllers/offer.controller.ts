import type { Request, Response } from 'express';
import { OFFER_SCOPE, ROLES } from '@shopswift/shared';
import { Offer, type IOffer } from '../models/Offer.model';
import { Team } from '../models/Team.model';
import { Cart } from '../models/Cart.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { validateAndPriceOffer } from '../services/offer.service';

function activeOfferFilter() {
  const now = new Date();
  return { isActive: true, startsAt: { $lte: now }, expiresAt: { $gte: now } };
}

export const listActiveOffers = asyncHandler(async (_req: Request, res: Response) => {
  const offers = await Offer.find({ ...activeOfferFilter(), scope: OFFER_SCOPE.GLOBAL }).sort({
    createdAt: -1,
  });
  sendSuccess(res, 200, offers.map((o) => o.toJSON()));
});

export const listActiveOffersForTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await Team.findOne({ slug: req.params.teamSlug });
  if (!team) throw ApiError.notFound('Team not found');

  const offers = await Offer.find({
    ...activeOfferFilter(),
    $or: [{ scope: OFFER_SCOPE.GLOBAL }, { scope: OFFER_SCOPE.TEAM, team: team._id }],
  }).sort({ createdAt: -1 });
  sendSuccess(res, 200, offers.map((o) => o.toJSON()));
});

export const validateOffer = asyncHandler(async (req: Request, res: Response) => {
  const cart = await Cart.findOne({ user: req.user!.id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Your cart is empty');
  }

  const lines = cart.items.map((item) => {
    const product = item.product as unknown as {
      _id: { toString(): string };
      team: { toString(): string };
      price: number;
    };
    return {
      productId: product._id.toString(),
      teamId: product.team.toString(),
      unitPrice: product.price,
      quantity: item.quantity,
    };
  });

  const result = await validateAndPriceOffer(lines, req.body.code, req.user!.id);
  sendSuccess(res, 200, {
    valid: result.valid,
    reason: result.reason,
    discountAmount: result.discountAmount,
    eligibleSubtotal: result.eligibleSubtotal,
    code: result.offer?.code,
  });
});

export const createOffer = asyncHandler(async (req: Request, res: Response) => {
  const isRaceTeam = req.user!.role === ROLES.RACETEAM;
  const payload = { ...req.body };

  if (isRaceTeam) {
    if (!req.user!.team) throw ApiError.forbidden('Your account is not linked to a team');
    payload.scope = OFFER_SCOPE.TEAM;
    payload.team = req.user!.team;
  }

  const offer = await Offer.create({
    ...payload,
    createdBy: req.user!.id,
    createdByRole: req.user!.role,
  });
  sendSuccess(res, 201, offer.toJSON(), 'Offer created');
});

export const listMyOffers = asyncHandler(async (req: Request, res: Response) => {
  const offers = await Offer.find({ team: req.user!.team }).sort({ createdAt: -1 });
  sendSuccess(res, 200, offers.map((o) => o.toJSON()));
});

export const listAllOffers = asyncHandler(async (_req: Request, res: Response) => {
  const offers = await Offer.find().sort({ createdAt: -1 }).populate('team', 'name slug');
  sendSuccess(res, 200, offers.map((o) => o.toJSON()));
});

export const updateOffer = asyncHandler(async (req: Request, res: Response) => {
  const offer = req.resource as IOffer;
  Object.assign(offer, req.body);
  await offer.save();
  sendSuccess(res, 200, offer.toJSON(), 'Offer updated');
});

export const deleteOffer = asyncHandler(async (req: Request, res: Response) => {
  const offer = req.resource as IOffer;
  offer.isActive = false;
  await offer.save();
  sendSuccess(res, 200, null, 'Offer deactivated');
});

