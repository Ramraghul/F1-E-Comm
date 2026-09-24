import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  registerSchema,
  registerRaceTeamSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordBodySchema,
  resetPasswordParamsSchema,
} from '../validators/auth.validators';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new customer account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterInput' }
 *     responses:
 *       201:
 *         description: Account created and logged in
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       409: { $ref: '#/components/responses/ValidationError' }
 */
router.post('/register', validate({ body: registerSchema }), authController.register);

/**
 * @openapi
 * /auth/register/raceteam:
 *   post:
 *     tags: [Auth]
 *     summary: Apply for a Race Team (multi-vendor seller) account
 *     description: >
 *       Creates a raceteam account scoped to the given team, with `isApproved=false`.
 *       Login is blocked until an admin approves it via
 *       `PATCH /admin/raceteams/{userId}/approve`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterRaceTeamInput' }
 *     responses:
 *       201: { description: Application submitted, pending approval }
 *       409: { $ref: '#/components/responses/ValidationError' }
 */
router.post(
  '/register/raceteam',
  validate({ body: registerRaceTeamSchema }),
  authController.registerRaceTeam,
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive an access token (refresh token set as httpOnly cookie)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginInput' }
 *     responses:
 *       200:
 *         description: Logged in
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { description: "Account deactivated or Race Team pending approval" }
 */
router.post('/login', validate({ body: loginSchema }), authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate the refresh token cookie and issue a new access token
 *     responses:
 *       200:
 *         description: New tokens issued
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
router.post('/refresh', authController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke the current refresh token and clear the cookie
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Logged out }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
router.post('/logout', protect, authController.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current authenticated user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/User' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
router.get('/me', protect, authController.me);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset token (logged server-side in dev, would be emailed in prod)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties: { email: { type: string, format: email } }
 *     responses:
 *       200: { description: "Always 200 to avoid leaking which emails are registered" }
 */
router.post(
  '/forgot-password',
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);

/**
 * @openapi
 * /auth/reset-password/{token}:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using the token issued by /auth/forgot-password
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties: { password: { type: string, format: password } }
 *     responses:
 *       200: { description: Password reset }
 *       400: { $ref: '#/components/responses/ValidationError' }
 */
router.post(
  '/reset-password/:token',
  validate({ params: resetPasswordParamsSchema, body: resetPasswordBodySchema }),
  authController.resetPassword,
);

export default router;
