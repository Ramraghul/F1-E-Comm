import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  addCartItemSchema,
  updateCartItemSchema,
  productIdParamSchema,
  mergeCartSchema,
} from '../validators/cart.validators';

const router = Router();
router.use(protect);

/**
 * @openapi
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get my cart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cart }
 *   delete:
 *     tags: [Cart]
 *     summary: Clear my cart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cart cleared }
 */
router.get('/', cartController.getCart);
router.delete('/', cartController.clearCart);

/**
 * @openapi
 * /cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add an item to my cart (re-checks live stock)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: string }
 *               quantity: { type: integer, default: 1 }
 *     responses:
 *       200: { description: Item added }
 *       409: { description: Insufficient stock }
 */
router.post('/items', validate({ body: addCartItemSchema }), cartController.addItem);

/**
 * @openapi
 * /cart/items/{productId}:
 *   patch:
 *     tags: [Cart]
 *     summary: Update an item's quantity
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Cart]
 *     summary: Remove an item from the cart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Removed }
 */
router.patch(
  '/items/:productId',
  validate({ params: productIdParamSchema, body: updateCartItemSchema }),
  cartController.updateItemQuantity,
);
router.delete(
  '/items/:productId',
  validate({ params: productIdParamSchema }),
  cartController.removeItem,
);

/**
 * @openapi
 * /cart/merge:
 *   post:
 *     tags: [Cart]
 *     summary: Merge a guest (localStorage) cart into the server cart on login
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: string }
 *                     quantity: { type: integer }
 *     responses:
 *       200: { description: Merged cart }
 */
router.post('/merge', validate({ body: mergeCartSchema }), cartController.mergeGuestCart);

export default router;
