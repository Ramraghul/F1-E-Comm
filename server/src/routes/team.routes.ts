import { Router } from 'express';
import { ROLES } from '@shopswift/shared';
import * as teamController from '../controllers/team.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { idParamSchema } from '../validators/common.validators';
import { createTeamSchema, updateTeamSchema } from '../validators/team.validators';

const router = Router();

/**
 * @openapi
 * /teams:
 *   get:
 *     tags: [Teams]
 *     summary: List all active F1 teams
 *     responses:
 *       200:
 *         description: List of teams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Team' }
 *   post:
 *     tags: [Teams]
 *     summary: Create a team (admin only)
 *     description: "**Requires role:** admin"
 *     x-required-roles: [admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateTeamInput' }
 *     responses:
 *       201: { description: Team created }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 */
router.get('/', teamController.listTeams);
router.post(
  '/',
  protect,
  authorize(ROLES.ADMIN),
  validate({ body: createTeamSchema }),
  teamController.createTeam,
);

/**
 * @openapi
 * /teams/{slug}:
 *   get:
 *     tags: [Teams]
 *     summary: Get a team by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Team }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.get('/:slug', teamController.getTeamBySlug);

/**
 * @openapi
 * /teams/{id}:
 *   patch:
 *     tags: [Teams]
 *     summary: Update a team (admin only)
 *     description: "**Requires role:** admin"
 *     x-required-roles: [admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Teams]
 *     summary: Deactivate a team (admin only)
 *     description: "**Requires role:** admin"
 *     x-required-roles: [admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Deactivated }
 */
router.patch(
  '/:id',
  protect,
  authorize(ROLES.ADMIN),
  validate({ params: idParamSchema, body: updateTeamSchema }),
  teamController.updateTeam,
);
router.delete(
  '/:id',
  protect,
  authorize(ROLES.ADMIN),
  validate({ params: idParamSchema }),
  teamController.deleteTeam,
);

export default router;
