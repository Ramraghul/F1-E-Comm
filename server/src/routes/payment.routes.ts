import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';
import { objectIdSchema } from '../validators/common.validators';

const router = Router();

/**
 * @openapi
 * /payments/create-intent/{orderId}:
 *   post:
 *     tags: [Payments]
 *     summary: (Re)create a Stripe PaymentIntent for an existing pending order
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: New client secret }
 *       409: { description: Order already paid }
 */
router.post(
  '/create-intent/:orderId',
  protect,
  validate({ params: z.object({ orderId: objectIdSchema }) }),
  paymentController.createOrRetryIntent,
);

/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Stripe webhook (signature-verified; not for manual use)
 *     description: >
 *       Registered against Stripe with a raw JSON body — mounted directly in `app.ts`
 *       with `express.raw()`, ahead of this router, so this path is documented here but
 *       not actually handled by this router instance.
 *     responses:
 *       200: { description: Event processed }
 *       400: { description: Invalid signature }
 */
// NOTE: the actual handler is mounted directly on the app in app.ts, with
// express.raw() applied only to this path, ahead of the global express.json()
// middleware — Stripe signature verification requires the exact raw body bytes.

export default router;
