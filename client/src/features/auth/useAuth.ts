import { useAppSelector } from '../../app/hooks';

export function useAuth() {
  const { user, accessToken, status } = useAppSelector((s) => s.auth);
  return {
    user,
    isAuthenticated: !!accessToken && !!user,
    isChecking: status === 'checking',
    role: user?.role ?? null,
  };
}
