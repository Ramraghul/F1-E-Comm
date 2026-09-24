import { useAuthBootstrap } from './features/auth/useAuthBootstrap';
import { useMergeCartOnLogin } from './features/cart/useMergeCartOnLogin';
import { AppRouter } from './routes/AppRouter';

export default function App() {
  useAuthBootstrap();
  useMergeCartOnLogin();
  return <AppRouter />;
}
