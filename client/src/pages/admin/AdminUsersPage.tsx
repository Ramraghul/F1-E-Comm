import { useState } from 'react';
import { useListUsersQuery, useAdminUpdateUserMutation, useDeleteUserMutation } from '../../features/users/usersApi';
import { PageSpinner } from '../../components/Spinner';
import { apiErrorMessage, useToast } from '../../features/ui/useToast';
import { useAuth } from '../../features/auth/useAuth';
import { ALL_ROLES } from '@shopswift/shared';

export default function AdminUsersPage() {
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListUsersQuery({ page, limit: 20, role: role || undefined });
  const [updateUser] = useAdminUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const { user: currentUser } = useAuth();
  const toast = useToast();

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      await updateUser({ id, body: { isActive: !isActive } }).unwrap();
      toast(isActive ? 'User deactivated' : 'User reactivated', 'success');
    } catch (err) {
      toast(apiErrorMessage(err), 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Permanently delete this user?')) return;
    await deleteUser(id).unwrap().catch((err) => toast(apiErrorMessage(err), 'error'));
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Users</h1>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="input-field w-auto"
        >
          <option value="">All roles</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data?.data.map((user) => {
              const isSelf = user.id === currentUser?.id;
              return (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium text-white">
                    {user.name}
                    {isSelf && <span className="ml-2 text-xs text-white/30">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-white/60">{user.email}</td>
                  <td className="px-4 py-3 capitalize text-white/60">{user.role}</td>
                  <td className="px-4 py-3">
                    <span className={user.isActive ? 'text-emerald-400' : 'text-white/30'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isSelf ? (
                      <span className="text-xs text-white/20" title="You cannot deactivate or delete your own account">
                        No actions
                      </span>
                    ) : (
                      <>
                        <button type="button" onClick={() => handleToggleActive(user.id, user.isActive)} className="mr-3 text-xs text-white/50 hover:text-white">
                          {user.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                        <button type="button" onClick={() => handleDelete(user.id)} className="text-xs text-f1red-light hover:underline">
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline px-3 py-1.5 text-xs disabled:opacity-30">
            Prev
          </button>
          <span className="px-2 text-xs text-white/40">
            {data.pagination.page} / {data.pagination.totalPages}
          </span>
          <button disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-outline px-3 py-1.5 text-xs disabled:opacity-30">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
