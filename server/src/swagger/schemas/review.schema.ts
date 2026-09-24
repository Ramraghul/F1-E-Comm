/**
 * @openapi
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         product: { type: string }
 *         user: { type: string }
 *         rating: { type: integer, minimum: 1, maximum: 5 }
 *         comment: { type: string }
 *         isVerifiedPurchase: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *     CreateReviewInput:
 *       type: object
 *       required: [rating, comment]
 *       properties:
 *         rating: { type: integer, minimum: 1, maximum: 5 }
 *         comment: { type: string }
 */
export {};
