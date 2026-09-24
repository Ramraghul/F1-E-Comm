import { useListTeamsQuery } from '../features/teams/teamsApi';
import { TeamBadge } from '../components/TeamBadge';
import { PageSpinner } from '../components/Spinner';

export default function TeamsPage() {
  const { data, isLoading } = useListTeamsQuery();

  if (isLoading) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">The Grid</h1>
      <p className="mt-1 text-white/50">Every constructor, every store.</p>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data?.data.map((team) => <TeamBadge key={team.id} team={team} />)}
      </div>
    </div>
  );
}
