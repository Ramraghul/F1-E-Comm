/**
 * @openapi
 * components:
 *   schemas:
 *     Offer:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         code: { type: string, example: PITSTOP10 }
 *         description: { type: string }
 *         discountType: { type: string, enum: [percent, flat] }
 *         discountValue: { type: number }
 *         scope: { type: string, enum: [global, team] }
 *         team: { type: string, nullable: true }
 *         minOrderValue: { type: integer }
 *         maxDiscountAmount: { type: integer, nullable: true }
 *         usageLimit: { type: integer, nullable: true }
 *         usageLimitPerUser: { type: integer }
 *         usedCount: { type: integer }
 *         startsAt: { type: string, format: date-time }
 *         expiresAt: { type: string, format: date-time }
 *         isActive: { type: boolean }
 *         tag: { type: string, enum: [flash-sale, race-weekend, seasonal, clearance] }
 *         createdBy: { type: string }
 *     CreateOfferInput:
 *       type: object
 *       required: [code, description, discountType, discountValue, scope, startsAt, expiresAt]
 *       properties:
 *         code: { type: string }
 *         description: { type: string }
 *         discountType: { type: string, enum: [percent, flat] }
 *         discountValue: { type: number }
 *         scope: { type: string, enum: [global, team] }
 *         team:
 *           type: string
 *           description: "Required if scope=team; raceteam callers are always forced to their own team"
 *         minOrderValue: { type: integer }
 *         maxDiscountAmount: { type: integer }
 *         usageLimit: { type: integer }
 *         usageLimitPerUser: { type: integer }
 *         startsAt: { type: string, format: date-time }
 *         expiresAt: { type: string, format: date-time }
 *         tag: { type: string, enum: [flash-sale, race-weekend, seasonal, clearance] }
 *     ValidateOfferInput:
 *       type: object
 *       required: [code]
 *       properties:
 *         code: { type: string, example: PITSTOP10 }
 *     OfferValidationResult:
 *       type: object
 *       properties:
 *         valid: { type: boolean }
 *         reason: { type: string }
 *         discountAmount: { type: integer }
 *         eligibleSubtotal: { type: integer }
 */
export {};
