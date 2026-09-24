import { useState } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { useUpdateMyProfileMutation, useUpdateMyPasswordMutation } from '../features/users/usersApi';
import { useAppDispatch } from '../app/hooks';
import { userUpdated, loggedOut } from '../features/auth/authSlice';
import { apiErrorMessage, useToast } from '../features/ui/useToast';

export default function AccountPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [updateProfile, { isLoading: savingProfile }] = useUpdateMyProfileMutation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatePassword, { isLoading: savingPassword }] = useUpdateMyPasswordMutation();

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await updateProfile({ name }).unwrap();
      dispatch(userUpdated(res.data));
      toast('Profile updated', 'success');
    } catch (err) {
      toast(apiErrorMessage(err, 'Could not update profile'), 'error');
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updatePassword({ currentPassword, newPassword }).unwrap();
      toast('Password updated — please log in again', 'success');
      dispatch(loggedOut());
    } catch (err) {
      toast(apiErrorMessage(err, 'Could not update password'), 'error');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12 sm:px-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">My Account</h1>
        <p className="mt-1 text-sm text-white/50">{user?.email}</p>
      </div>

      <form onSubmit={handleProfileSubmit} className="card-surface space-y-4 rounded-lg p-6">
        <h2 className="font-display text-lg font-bold text-white">Profile</h2>
        <label className="block">
          <span className="label">Full Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </label>
        <button type="submit" disabled={savingProfile} className="btn-outline">
          {savingProfile ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card-surface space-y-4 rounded-lg p-6">
        <h2 className="font-display text-lg font-bold text-white">Change Password</h2>
        <label className="block">
          <span className="label">Current Password</span>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input-field"
          />
        </label>
        <label className="block">
          <span className="label">New Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-field"
          />
        </label>
        <button type="submit" disabled={savingPassword} className="btn-outline">
          {savingPassword ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
