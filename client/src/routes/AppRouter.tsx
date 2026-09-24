import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { RaceTeamLayout } from '../layouts/RaceTeamLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { StorefrontRoute } from './StorefrontRoute';
import { PageSpinner } from '../components/Spinner';
import { ROLES } from '@shopswift/shared';

const HomePage = lazy(() => import('../pages/HomePage'));
const TeamsPage = lazy(() => import('../pages/TeamsPage'));
const TeamDetailPage = lazy(() => import('../pages/TeamDetailPage'));
const ProductsPage = lazy(() => import('../pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const OffersPage = lazy(() => import('../pages/OffersPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('../pages/OrderConfirmationPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const RegisterRaceTeamPage = lazy(() => import('../pages/RegisterRaceTeamPage'));
const AccountPage = lazy(() => import('../pages/AccountPage'));
const AccountOrdersPage = lazy(() => import('../pages/AccountOrdersPage'));
const AccountOrderDetailPage = lazy(() => import('../pages/AccountOrderDetailPage'));
const WishlistPage = lazy(() => import('../pages/WishlistPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const AdminOverviewPage = lazy(() => import('../pages/admin/AdminOverviewPage'));
const AdminRaceTeamApprovalsPage = lazy(() => import('../pages/admin/AdminRaceTeamApprovalsPage'));
const AdminTeamsPage = lazy(() => import('../pages/admin/AdminTeamsPage'));
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminOffersPage = lazy(() => import('../pages/admin/AdminOffersPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));

const RaceTeamOverviewPage = lazy(() => import('../pages/raceteam/RaceTeamOverviewPage'));
const RaceTeamProductsPage = lazy(() => import('../pages/raceteam/RaceTeamProductsPage'));
const RaceTeamOffersPage = lazy(() => import('../pages/raceteam/RaceTeamOffersPage'));
const RaceTeamOrdersPage = lazy(() => import('../pages/raceteam/RaceTeamOrdersPage'));

export function AppRouter() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route element={<StorefrontRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="teams/:slug" element={<TeamDetailPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="register/raceteam" element={<RegisterRaceTeamPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order-confirmation/:id" element={<OrderConfirmationPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="account/orders" element={<AccountOrdersPage />} />
              <Route path="account/orders/:id" element={<AccountOrderDetailPage />} />
              <Route path="account/wishlist" element={<WishlistPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allow={[ROLES.ADMIN]} />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="raceteams" element={<AdminRaceTeamApprovalsPage />} />
            <Route path="teams" element={<AdminTeamsPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="offers" element={<AdminOffersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allow={[ROLES.RACETEAM]} />}>
          <Route path="raceteam" element={<RaceTeamLayout />}>
            <Route index element={<RaceTeamOverviewPage />} />
            <Route path="products" element={<RaceTeamProductsPage />} />
            <Route path="offers" element={<RaceTeamOffersPage />} />
            <Route path="orders" element={<RaceTeamOrdersPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
