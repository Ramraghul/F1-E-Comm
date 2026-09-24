import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useListTeamsQuery } from '../features/teams/teamsApi';
import { useRegisterRaceTeamMutation } from '../features/auth/authApi';
import { apiErrorMessage, useToast } from '../features/ui/useToast';

export default function RegisterRaceTeamPage() {
  const { data: teams } = useListTeamsQuery();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamId, setTeamId] = useState('');
  const [registerRaceTeam, { isLoading }] = useRegisterRaceTeamMutation();
  const navigate = useNavigate();
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await registerRaceTeam({ name, email, password, teamId }).unwrap();
      toast('Application submitted! An admin will review and approve your account.', 'success');
      navigate('/login');
    } catch (err) {
      toast(apiErrorMessage(err, 'Application failed'), 'error');
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">Sell as a Race Team</h1>
      <p className="mt-1 text-sm text-white/50">
        Get your own store front to manage products, offers and orders for your team.
        Applications require admin approval before you can log in.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="label">Your Team</span>
          <select required value={teamId} onChange={(e) => setTeamId(e.target.value)} className="input-field">
            <option value="" disabled>
              Select a team…
            </option>
            {teams?.data.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Contact Name</span>
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
        </label>
        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? 'Submitting…' : 'Submit Application'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Not a team?{' '}
        <Link to="/register" className="font-semibold text-white hover:underline">
          Create a customer account
        </Link>
      </p>
    </div>
  );
}
