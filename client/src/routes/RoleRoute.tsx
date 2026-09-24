import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '@shopswift/shared';
import { useAuth } from '../features/auth/useAuth';
import { PageSpinner } from '../components/Spinner';

export function RoleRoute({ allow }: { allow: Role[] }) {
  const { isAuthenticated, isChecking, role } = useAuth();

  if (isChecking) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!role || !allow.includes(role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
