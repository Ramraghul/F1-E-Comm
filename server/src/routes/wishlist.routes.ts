import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { productIdParamSchema } from '../validators/cart.validators';

const router = Router();
router.use(protect);

/**
 * @openapi
 * /wishlist:
 *   get:
 *     tags: [Wishlist]
 *     summary: Get my wishlist
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Wishlist }
 */
router.get('/', wishlistController.getMyWishlist);

/**
 * @openapi
 * /wishlist/{productId}:
 *   post:
 *     tags: [Wishlist]
 *     summary: Add a product to my wishlist (idempotent — adding twice is a no-op)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated wishlist }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *   delete:
 *     tags: [Wishlist]
 *     summary: Remove a product from my wishlist
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated wishlist }
 */
router.post(
  '/:productId',
  validate({ params: productIdParamSchema }),
  wishlistController.addToWishlist,
);
router.delete(
  '/:productId',
  validate({ params: productIdParamSchema }),
  wishlistController.removeFromWishlist,
);

export default router;
