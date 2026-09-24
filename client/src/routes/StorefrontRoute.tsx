import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { PageSpinner } from '../components/Spinner';

/** Admin and Race Team accounts are back-office roles — they don't shop, so keep them
 * out of the customer storefront (cart/checkout/wishlist included) and send them to
 * their own dashboard instead. */
export function StorefrontRoute() {
  const { isAuthenticated, isChecking, role } = useAuth();

  if (isChecking) return <PageSpinner />;
  if (isAuthenticated && role === 'admin') return <Navigate to="/admin" replace />;
  if (isAuthenticated && role === 'raceteam') return <Navigate to="/raceteam" replace />;

  return <Outlet />;
}
