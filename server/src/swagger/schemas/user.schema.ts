/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         email: { type: string, format: email }
 *         role: { type: string, enum: [user, admin, raceteam] }
 *         team: { type: string, nullable: true, description: "Team id, only for role=raceteam" }
 *         isApproved: { type: boolean }
 *         isActive: { type: boolean }
 *         addresses:
 *           type: array
 *           items: { $ref: '#/components/schemas/Address' }
 *         createdAt: { type: string, format: date-time }
 *     AuthTokens:
 *       type: object
 *       properties:
 *         accessToken: { type: string }
 *         accessTokenExpiresAt: { type: string, format: date-time }
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: true }
 *         data:
 *           type: object
 *           properties:
 *             user: { $ref: '#/components/schemas/User' }
 *             tokens: { $ref: '#/components/schemas/AuthTokens' }
 *     RegisterInput:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name: { type: string, example: Lewis Fanboy }
 *         email: { type: string, format: email }
 *         password: { type: string, format: password, example: "Passw0rd!" }
 *     RegisterRaceTeamInput:
 *       allOf:
 *         - $ref: '#/components/schemas/RegisterInput'
 *         - type: object
 *           required: [teamId]
 *           properties:
 *             teamId: { type: string, description: "Team _id to apply for (from GET /teams)" }
 *     LoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, format: email }
 *         password: { type: string, format: password }
 */
export {};
