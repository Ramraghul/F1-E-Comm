import { Router } from 'express';
import { ROLES } from '@shopswift/shared';
import * as raceteamController from '../controllers/raceteam.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

/**
 * @openapi
 * /raceteam/analytics:
 *   get:
 *     tags: [RaceTeam]
 *     summary: My team's revenue, orders, top products, and low-stock alerts
 *     description: "**Requires role:** raceteam"
 *     x-required-roles: [raceteam]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Team analytics }
 */
router.get('/analytics', protect, authorize(ROLES.RACETEAM), raceteamController.getMyTeamAnalytics);

export default router;
