import { Router } from 'express';
import { ROLES } from '@shopswift/shared';
import * as productController from '../controllers/product.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize, authorizeTeamOwnership } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { idParamSchema } from '../validators/common.validators';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  stockUpdateSchema,
} from '../validators/product.validators';
import { Product } from '../models/Product.model';
import reviewRouter from './review.routes';

const router = Router();

// Nested: GET/POST /products/:productId/reviews
router.use('/:productId/reviews', reviewRouter);

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Browse products (public) — filter, search, sort, paginate
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: team
 *         schema: { type: string }
 *         description: team slug
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [apparel, headwear, model-cars, accessories, collectibles, other] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: integer }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: integer }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [price_asc, price_desc, newest, rating, featured] }
 *     responses:
 *       200:
 *         description: Paginated products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *   post:
 *     tags: [Products]
 *     summary: Create a product
 *     description: >
 *       **Requires role:** admin or raceteam. A raceteam caller's product is always
 *       created under their own team, regardless of any `team` field sent.
 *     x-required-roles: [admin, raceteam]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateProductInput' }
 *     responses:
 *       201: { description: Product created }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 */
router.get('/', validate({ query: productQuerySchema }), productController.listProducts);
router.post(
  '/',
  protect,
  authorize(ROLES.ADMIN, ROLES.RACETEAM),
  validate({ body: createProductSchema }),
  productController.createProduct,
);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *   patch:
 *     tags: [Products]
 *     summary: Update a product
 *     description: >
 *       **Requires role:** admin, or raceteam owning this product's team
 *       (enforced by `authorizeTeamOwnership`).
 *     x-required-roles: [admin, raceteam]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *   delete:
 *     tags: [Products]
 *     summary: Deactivate a product
 *     description: "**Requires role:** admin, or raceteam owning this product's team"
 *     x-required-roles: [admin, raceteam]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Removed }
 */
router.get('/:id', validate({ params: idParamSchema }), productController.getProduct);
router.patch(
  '/:id',
  protect,
  authorize(ROLES.ADMIN, ROLES.RACETEAM),
  validate({ params: idParamSchema, body: updateProductSchema }),
  authorizeTeamOwnership(Product),
  productController.updateProduct,
);
router.delete(
  '/:id',
  protect,
  authorize(ROLES.ADMIN, ROLES.RACETEAM),
  validate({ params: idParamSchema }),
  authorizeTeamOwnership(Product),
  productController.deleteProduct,
);

/**
 * @openapi
 * /products/{id}/stock:
 *   patch:
 *     tags: [Products]
 *     summary: Quick stock adjustment
 *     description: "**Requires role:** admin, or raceteam owning this product's team"
 *     x-required-roles: [admin, raceteam]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stock]
 *             properties: { stock: { type: integer, minimum: 0 } }
 *     responses:
 *       200: { description: Updated }
 */
router.patch(
  '/:id/stock',
  protect,
  authorize(ROLES.ADMIN, ROLES.RACETEAM),
  validate({ params: idParamSchema, body: stockUpdateSchema }),
  authorizeTeamOwnership(Product),
  productController.updateStock,
);

export default router;
