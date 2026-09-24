/**
 * @openapi
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         product: { type: string }
 *         team: { type: string }
 *         name: { type: string }
 *         image: { type: string }
 *         unitPrice: { type: integer }
 *         quantity: { type: integer }
 *         subtotal: { type: integer }
 *     Order:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         orderNumber: { type: string }
 *         user: { type: string }
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/OrderItem' }
 *         shippingAddress: { $ref: '#/components/schemas/Address' }
 *         itemsTotal: { type: integer }
 *         discountAmount: { type: integer }
 *         shippingFee: { type: integer }
 *         totalAmount: { type: integer }
 *         paymentStatus: { type: string, enum: [unpaid, paid, failed, refunded] }
 *         status: { type: string, enum: [pending, paid, processing, shipped, delivered, cancelled] }
 *         createdAt: { type: string, format: date-time }
 *     CreateOrderInput:
 *       type: object
 *       required: [items, shippingAddress]
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: string }
 *               quantity: { type: integer, minimum: 1 }
 *         shippingAddress: { $ref: '#/components/schemas/Address' }
 *         offerCode: { type: string }
 *     CreateOrderResponse:
 *       type: object
 *       properties:
 *         order: { $ref: '#/components/schemas/Order' }
 *         clientSecret: { type: string, description: "Stripe PaymentIntent client secret" }
 *     UpdateOrderStatusInput:
 *       type: object
 *       required: [status]
 *       properties:
 *         status: { type: string, enum: [pending, paid, processing, shipped, delivered, cancelled] }
 */
export {};
