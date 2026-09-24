import { Router } from 'express';
import { ROLES } from '@shopswift/shared';
import * as adminController from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';
import { objectIdSchema } from '../validators/common.validators';

const router = Router();
router.use(protect, authorize(ROLES.ADMIN));

/**
 * @openapi
 * /admin/analytics/overview:
 *   get:
 *     tags: [Admin]
 *     summary: Site-wide KPI overview
 *     description: "**Requires role:** admin"
 *     x-required-roles: [admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Overview analytics }
 */
router.get('/analytics/overview', adminController.getOverviewAnalytics);

/**
 * @openapi
 * /admin/analytics/sales-by-team:
 *   get:
 *     tags: [Admin]
 *     summary: Revenue/units/order-count broken down by team
 *     description: "**Requires role:** admin"
 *     x-required-roles: [admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Sales by team }
 */
router.get('/analytics/sales-by-team', adminController.getSalesByTeam);

/**
 * @openapi
 * /admin/raceteams/pending:
 *   get:
 *     tags: [Admin]
 *     summary: List Race Team accounts awaiting approval
 *     description: "**Requires role:** admin"
 *     x-required-roles: [admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Pending applications }
 */
router.get('/raceteams/pending', adminController.listPendingRaceTeams);

/**
 * @openapi
 * /admin/raceteams/{userId}/approve:
 *   patch:
 *     tags: [Admin]
 *     summary: Approve a pending Race Team account
 *     description: "**Requires role:** admin"
 *     x-required-roles: [admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Approved }
 */
router.patch(
  '/raceteams/:userId/approve',
  validate({ params: z.object({ userId: objectIdSchema }) }),
  adminController.approveRaceTeam,
);

/**
 * @openapi
 * /admin/raceteams/{userId}/reject:
 *   patch:
 *     tags: [Admin]
 *     summary: Reject a pending Race Team account (deactivates it)
 *     description: "**Requires role:** admin"
 *     x-required-roles: [admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Rejected }
 */
router.patch(
  '/raceteams/:userId/reject',
  validate({ params: z.object({ userId: objectIdSchema }) }),
  adminController.rejectRaceTeam,
);

export default router;
