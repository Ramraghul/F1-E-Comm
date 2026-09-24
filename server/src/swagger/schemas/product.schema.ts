/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         team: { type: string }
 *         name: { type: string }
 *         slug: { type: string }
 *         description: { type: string }
 *         category: { type: string, enum: [apparel, headwear, model-cars, accessories, collectibles, other] }
 *         price: { type: integer, description: "Integer minor units (cents)", example: 4999 }
 *         currency: { type: string, example: USD }
 *         stock: { type: integer }
 *         sku: { type: string }
 *         images:
 *           type: array
 *           items: { type: string, format: uri }
 *         driverTag: { type: string }
 *         sizes:
 *           type: array
 *           items: { type: string }
 *         isFeatured: { type: boolean }
 *         isActive: { type: boolean }
 *         ratingsAverage: { type: number }
 *         ratingsCount: { type: integer }
 *         createdBy: { type: string }
 *         createdAt: { type: string, format: date-time }
 *     CreateProductInput:
 *       type: object
 *       required: [name, description, category, price, stock, sku, images]
 *       properties:
 *         name: { type: string }
 *         description: { type: string }
 *         category: { type: string, enum: [apparel, headwear, model-cars, accessories, collectibles, other] }
 *         price: { type: integer, example: 4999 }
 *         stock: { type: integer }
 *         sku: { type: string }
 *         images:
 *           type: array
 *           items: { type: string, format: uri }
 *         driverTag: { type: string }
 *         sizes:
 *           type: array
 *           items: { type: string }
 *         isFeatured: { type: boolean }
 *         team:
 *           type: string
 *           description: "Admin only — raceteam callers are always forced to their own team"
 */
export {};
