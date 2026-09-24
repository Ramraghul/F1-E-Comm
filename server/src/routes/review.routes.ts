import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { idParamSchema } from '../validators/common.validators';
import { createReviewSchema } from '../validators/review.validators';

const router = Router({ mergeParams: true });

/**
 * @openapi
 * /products/{productId}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: List reviews for a product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Review' }
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review for a product
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateReviewInput' }
 *     responses:
 *       201: { description: Review created }
 *       409: { description: Already reviewed this product }
 */
router.get('/', reviewController.listReviewsForProduct);
router.post(
  '/',
  protect,
  validate({ body: createReviewSchema }),
  reviewController.createReview,
);

/**
 * @openapi
 * /reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete a review (owner or admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 */
export const standaloneReviewRouter = Router();
standaloneReviewRouter.delete(
  '/:id',
  protect,
  validate({ params: idParamSchema }),
  reviewController.deleteReview,
);

export default router;
