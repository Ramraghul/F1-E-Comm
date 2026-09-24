import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLoginMutation } from '../features/auth/authApi';
import { useAppDispatch } from '../app/hooks';
import { credentialsSet } from '../features/auth/authSlice';
import { apiErrorMessage, useToast } from '../features/ui/useToast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(credentialsSet({ user: res.data.user, accessToken: res.data.tokens.accessToken }));
      toast(`Welcome back, ${res.data.user.name.split(' ')[0]}!`, 'success');
      const redirect = params.get('redirect');
      const roleHome = res.data.user.role === 'admin' ? '/admin' : res.data.user.role === 'raceteam' ? '/raceteam' : '/';
      navigate(redirect || roleHome);
    } catch (err) {
      toast(apiErrorMessage(err, 'Login failed'), 'error');
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">Log In</h1>
      <p className="mt-1 text-sm text-white/50">Welcome back to the grid.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="label">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
        </label>
        <label className="block">
          <span className="label">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </label>
        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        No account?{' '}
        <Link to="/register" className="font-semibold text-white hover:underline">
          Sign up
        </Link>
        {' · '}
        <Link to="/register/raceteam" className="font-semibold text-white hover:underline">
          Sell as a Race Team
        </Link>
      </p>

      <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4 text-xs text-white/40">
        <p className="mb-1 font-semibold text-white/60">Demo credentials (after seeding)</p>
        <p>Admin: admin@shopswift.dev / Admin@12345</p>
        <p>Race Team: raceteam+mercedes@shopswift.dev / RaceTeam@12345</p>
        <p>Customer: customer@shopswift.dev / Customer@12345</p>
      </div>
    </div>
  );
}
