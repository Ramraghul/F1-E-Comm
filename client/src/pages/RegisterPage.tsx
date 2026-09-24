import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../features/auth/authApi';
import { useAppDispatch } from '../app/hooks';
import { credentialsSet } from '../features/auth/authSlice';
import { apiErrorMessage, useToast } from '../features/ui/useToast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await register({ name, email, password }).unwrap();
      dispatch(credentialsSet({ user: res.data.user, accessToken: res.data.tokens.accessToken }));
      toast('Account created — welcome to Shop Swift!', 'success');
      navigate('/');
    } catch (err) {
      toast(apiErrorMessage(err, 'Registration failed'), 'error');
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">Create an Account</h1>
      <p className="mt-1 text-sm text-white/50">Join the grid — track orders, save addresses, and more.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="label">Full Name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </label>
        <label className="block">
          <span className="label">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
        </label>
        <label className="block">
          <span className="label">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
          <span className="mt-1 block text-xs text-white/30">
            8+ characters, with an uppercase letter, lowercase letter, and number.
          </span>
        </label>
        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-white hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
