import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { PageSpinner } from '../components/Spinner';

export function ProtectedRoute() {
  const { isAuthenticated, isChecking } = useAuth();
  const location = useLocation();

  if (isChecking) return <PageSpinner />;

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
}
