import { useListPendingRaceTeamsQuery, useApproveRaceTeamMutation, useRejectRaceTeamMutation } from '../../features/admin/adminApi';
import { PageSpinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';
import { apiErrorMessage, useToast } from '../../features/ui/useToast';

export default function AdminRaceTeamApprovalsPage() {
  const { data, isLoading } = useListPendingRaceTeamsQuery();
  const [approve, { isLoading: approving }] = useApproveRaceTeamMutation();
  const [reject, { isLoading: rejecting }] = useRejectRaceTeamMutation();
  const toast = useToast();

  if (isLoading) return <PageSpinner />;
  const applicants = data?.data ?? [];

  async function handleApprove(id: string) {
    try {
      await approve(id).unwrap();
      toast('Race Team approved', 'success');
    } catch (err) {
      toast(apiErrorMessage(err, 'Could not approve'), 'error');
    }
  }

  async function handleReject(id: string) {
    try {
      await reject(id).unwrap();
      toast('Application rejected', 'info');
    } catch (err) {
      toast(apiErrorMessage(err, 'Could not reject'), 'error');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Race Team Approvals</h1>
      <p className="mt-1 text-sm text-white/50">
        Applicants awaiting approval before they can log in and manage their team&apos;s store.
      </p>

      {applicants.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No pending applications" description="You're all caught up." />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {applicants.map((applicant) => (
            <li key={applicant.id} className="card-surface flex flex-wrap items-center justify-between gap-3 rounded-lg p-4">
              <div>
                <p className="font-semibold text-white">{applicant.name}</p>
                <p className="text-xs text-white/40">{applicant.email}</p>
                <p className="mt-1 text-xs text-white/50">
                  Team: {typeof applicant.team === 'object' && applicant.team ? applicant.team.name : '—'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={rejecting}
                  onClick={() => handleReject(applicant.id)}
                  className="btn-outline px-4 py-2 text-xs"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={approving}
                  onClick={() => handleApprove(applicant.id)}
                  className="btn-primary px-4 py-2 text-xs"
                >
                  Approve
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
