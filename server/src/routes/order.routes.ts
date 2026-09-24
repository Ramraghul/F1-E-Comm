import { Router } from 'express';
import { ROLES } from '@shopswift/shared';
import * as orderController from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { idParamSchema, paginationQuerySchema } from '../validators/common.validators';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from '../validators/order.validators';

const router = Router();
router.use(protect);

/**
 * @openapi
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create an order from the given items, re-priced and re-validated server-side
 *     description: >
 *       Creates a `pending` order and a Stripe PaymentIntent in one call. The server
 *       ignores any client-supplied prices/totals and recomputes everything from live
 *       product data and (if `offerCode` is given) the offers engine.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateOrderInput' }
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/CreateOrderResponse' }
 *       409: { description: Insufficient stock }
 *   get:
 *     tags: [Orders]
 *     summary: List every order (admin oversight)
 *     description: "**Requires role:** admin"
 *     x-required-roles: [admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated orders }
 */
router.post('/', validate({ body: createOrderSchema }), orderController.createOrder);
router.get(
  '/',
  authorize(ROLES.ADMIN),
  validate({ query: orderQuerySchema }),
  orderController.listAllOrders,
);

/**
 * @openapi
 * /orders/mine:
 *   get:
 *     tags: [Orders]
 *     summary: List my own orders
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated orders }
 */
router.get(
  '/mine',
  validate({ query: paginationQuerySchema }),
  orderController.listMyOrders,
);

/**
 * @openapi
 * /orders/team:
 *   get:
 *     tags: [Orders]
 *     summary: List orders containing my team's items (raceteam only)
 *     description: "**Requires role:** raceteam"
 *     x-required-roles: [raceteam]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated orders }
 */
router.get(
  '/team',
  authorize(ROLES.RACETEAM),
  validate({ query: paginationQuerySchema }),
  orderController.listTeamOrders,
);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get an order (owner, admin, or a raceteam whose items are in it)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Order }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 */
router.get('/:id', validate({ params: idParamSchema }), orderController.getOrderById);

/**
 * @openapi
 * /orders/{id}/cancel:
 *   patch:
 *     tags: [Orders]
 *     summary: Cancel my own order (only while still pending/unpaid)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cancelled }
 *       400: { description: Order is no longer cancellable }
 */
router.patch(
  '/:id/cancel',
  validate({ params: idParamSchema }),
  orderController.cancelMyOrder,
);

/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Transition an order's fulfillment status
 *     description: >
 *       **Requires role:** admin (any valid transition), or raceteam (only
 *       `processing→shipped→delivered`, and only for orders containing their own items).
 *     x-required-roles: [admin, raceteam]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateOrderStatusInput' }
 *     responses:
 *       200: { description: Updated }
 *       400: { description: Illegal status transition }
 */
router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.RACETEAM),
  validate({ params: idParamSchema, body: updateOrderStatusSchema }),
  orderController.updateOrderStatus,
);

export default router;
