/**
 * @openapi
 * components:
 *   schemas:
 *     ApiError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *               message:
 *                 type: string
 *     Address:
 *       type: object
 *       required: [label, line1, city, state, postalCode, country]
 *       properties:
 *         label: { type: string, example: Home }
 *         line1: { type: string }
 *         line2: { type: string }
 *         city: { type: string }
 *         state: { type: string }
 *         postalCode: { type: string }
 *         country: { type: string }
 *         isDefault: { type: boolean }
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         page: { type: integer }
 *         limit: { type: integer }
 *         total: { type: integer }
 *         totalPages: { type: integer }
 *   responses:
 *     UnauthorizedError:
 *       description: Missing/invalid access token
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ApiError' }
 *     ForbiddenError:
 *       description: Authenticated but not permitted (wrong role, or not your team's resource)
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ApiError' }
 *     NotFoundError:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ApiError' }
 *     ValidationError:
 *       description: Request failed validation
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ApiError' }
 */
export {};
