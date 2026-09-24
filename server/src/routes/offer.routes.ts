import { Router } from 'express';
import { ROLES } from '@shopswift/shared';
import * as offerController from '../controllers/offer.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize, authorizeTeamOwnership } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { idParamSchema } from '../validators/common.validators';
import {
  createOfferSchema,
  updateOfferSchema,
  validateOfferSchema,
} from '../validators/offer.validators';
import { Offer } from '../models/Offer.model';

const router = Router();

/**
 * @openapi
 * /offers:
 *   get:
 *     tags: [Offers]
 *     summary: List active global offers (for banners)
 *     responses:
 *       200: { description: Active global offers }
 *   post:
 *     tags: [Offers]
 *     summary: Create an offer
 *     description: >
 *       **Requires role:** admin or raceteam. A raceteam caller's offer is always
 *       forced to `scope=team` and their own team, regardless of what's sent.
 *     x-required-roles: [admin, raceteam]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateOfferInput' }
 *     responses:
 *       201: { description: Offer created }
 */
router.get('/', offerController.listActiveOffers);
router.post(
  '/',
  protect,
  authorize(ROLES.ADMIN, ROLES.RACETEAM),
  validate({ body: createOfferSchema }),
  offerController.createOffer,
);

/**
 * @openapi
 * /offers/team/{teamSlug}:
 *   get:
 *     tags: [Offers]
 *     summary: List active offers visible to a given team's shop page (global + that team's own)
 *     parameters:
 *       - in: path
 *         name: teamSlug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Active offers }
 */
router.get('/team/:teamSlug', offerController.listActiveOffersForTeam);

/**
 * @openapi
 * /offers/validate:
 *   post:
 *     tags: [Offers]
 *     summary: Preview a coupon code's discount against my current cart
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ValidateOfferInput' }
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/OfferValidationResult' }
 */
router.post(
  '/validate',
  protect,
  validate({ body: validateOfferSchema }),
  offerController.validateOffer,
);

/**
 * @openapi
 * /offers/mine:
 *   get:
 *     tags: [Offers]
 *     summary: List my team's offers (raceteam only)
 *     description: "**Requires role:** raceteam"
 *     x-required-roles: [raceteam]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: My team's offers }
 */
router.get('/mine', protect, authorize(ROLES.RACETEAM), offerController.listMyOffers);

/**
 * @openapi
 * /offers/all:
 *   get:
 *     tags: [Offers]
 *     summary: List every offer site-wide (admin oversight)
 *     description: "**Requires role:** admin"
 *     x-required-roles: [admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: All offers }
 */
router.get('/all', protect, authorize(ROLES.ADMIN), offerController.listAllOffers);

/**
 * @openapi
 * /offers/{id}:
 *   patch:
 *     tags: [Offers]
 *     summary: Update an offer
 *     description: "**Requires role:** admin, or raceteam owning this offer"
 *     x-required-roles: [admin, raceteam]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Offers]
 *     summary: Deactivate an offer
 *     description: "**Requires role:** admin, or raceteam owning this offer"
 *     x-required-roles: [admin, raceteam]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Deactivated }
 */
router.patch(
  '/:id',
  protect,
  authorize(ROLES.ADMIN, ROLES.RACETEAM),
  validate({ params: idParamSchema, body: updateOfferSchema }),
  authorizeTeamOwnership(Offer),
  offerController.updateOffer,
);
router.delete(
  '/:id',
  protect,
  authorize(ROLES.ADMIN, ROLES.RACETEAM),
  validate({ params: idParamSchema }),
  authorizeTeamOwnership(Offer),
  offerController.deleteOffer,
);

export default router;
