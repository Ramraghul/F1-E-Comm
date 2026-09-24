/**
 * @openapi
 * components:
 *   schemas:
 *     TeamDriver:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         number: { type: integer }
 *         nationality: { type: string }
 *     Team:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         slug: { type: string }
 *         nationality: { type: string }
 *         logoUrl: { type: string }
 *         colorPrimary: { type: string, example: "#00D2BE" }
 *         colorSecondary: { type: string }
 *         colorAccent: { type: string }
 *         description: { type: string }
 *         foundedYear: { type: integer }
 *         principal: { type: string }
 *         drivers:
 *           type: array
 *           items: { $ref: '#/components/schemas/TeamDriver' }
 *         isActive: { type: boolean }
 *     CreateTeamInput:
 *       type: object
 *       required: [name, slug, nationality, colorPrimary, colorSecondary, colorAccent, foundedYear]
 *       properties:
 *         name: { type: string }
 *         slug: { type: string }
 *         nationality: { type: string }
 *         logoUrl: { type: string }
 *         colorPrimary: { type: string }
 *         colorSecondary: { type: string }
 *         colorAccent: { type: string }
 *         description: { type: string }
 *         foundedYear: { type: integer }
 *         principal: { type: string }
 *         drivers:
 *           type: array
 *           items: { $ref: '#/components/schemas/TeamDriver' }
 */
export {};
