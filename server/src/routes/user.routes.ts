import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { ROLES } from '@shopswift/shared';
import { idParamSchema } from '../validators/common.validators';
import {
  updateProfileSchema,
  adminUpdateUserSchema,
  userQuerySchema,
} from '../validators/user.validators';
import { updatePasswordSchema } from '../validators/auth.validators';

const router = Router();

router.use(protect);

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get my profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *   patch:
 *     tags: [Users]
 *     summary: Update my profile (name, addresses)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 */
router.get('/me', userController.getMyProfile);
router.patch('/me', validate({ body: updateProfileSchema }), userController.updateMyProfile);

/**
 * @openapi
 * /users/me/password:
 *   patch:
 *     tags: [Users]
 *     summary: Change my password
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Password updated }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
router.patch(
  '/me/password',
  validate({ body: updatePasswordSchema }),
  userController.updateMyPassword,
);

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (admin only)
 *     description: "**Requires role:** admin"
 *     x-required-roles: [admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [user, admin, raceteam] }
 *     responses:
 *       200: { description: Paginated user list }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 */
router.get(
  '/',
  authorize(ROLES.ADMIN),
  validate({ query: userQuerySchema }),
  userController.listUsers,
);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by id (admin only)
 *     description: "**Requires role:** admin"
 *     x-required-roles: [admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *   patch:
 *     tags: [Users]
 *     summary: Update a user's role/active/approval status (admin only)
 *     description: "**Requires role:** admin"
 *     x-required-roles: [admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user (admin only)
 *     description: "**Requires role:** admin"
 *     x-required-roles: [admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Deleted }
 */
router.get(
  '/:id',
  authorize(ROLES.ADMIN),
  validate({ params: idParamSchema }),
  userController.getUserById,
);
router.patch(
  '/:id',
  authorize(ROLES.ADMIN),
  validate({ params: idParamSchema, body: adminUpdateUserSchema }),
  userController.adminUpdateUser,
);
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate({ params: idParamSchema }),
  userController.deleteUser,
);

export default router;
