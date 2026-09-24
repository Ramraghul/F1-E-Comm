import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import teamRoutes from './team.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import wishlistRoutes from './wishlist.routes';
import offerRoutes from './offer.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import { standaloneReviewRouter } from './review.routes';
import adminRoutes from './admin.routes';
import raceteamRoutes from './raceteam.routes';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200: { description: OK }
 */
router.get('/health', (_req, res) => res.status(200).json({ success: true, data: { status: 'ok' } }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/offers', offerRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', standaloneReviewRouter);
router.use('/admin', adminRoutes);
router.use('/raceteam', raceteamRoutes);

export default router;
