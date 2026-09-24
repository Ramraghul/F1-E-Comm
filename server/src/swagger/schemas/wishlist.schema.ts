/**
 * @openapi
 * components:
 *   schemas:
 *     WishlistItem:
 *       type: object
 *       properties:
 *         product: { $ref: '#/components/schemas/Product' }
 *         addedAt: { type: string, format: date-time }
 *     Wishlist:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         user: { type: string }
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/WishlistItem' }
 */
export {};
