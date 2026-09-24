import { Link } from 'react-router-dom';
import type { TeamDTO } from '@shopswift/shared';
import { teamStyleVars } from '../lib/teamTheme';

export function TeamBadge({ team }: { team: TeamDTO }) {
  return (
    <Link
      to={`/teams/${team.slug}`}
      style={teamStyleVars(team)}
      className="card-surface group relative flex flex-col items-center gap-3 overflow-hidden rounded-lg p-6 text-center transition hover:-translate-y-1"
    >
      <div
        className="absolute inset-x-0 top-0 h-1 opacity-90"
        style={{ background: `linear-gradient(90deg, var(--team-primary), transparent)` }}
      />
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full border-2 font-display text-xl font-bold text-white"
        style={{ borderColor: 'var(--team-primary)', background: 'var(--team-secondary)' }}
      >
        {team.name
          .split(' ')
          .slice(0, 2)
          .map((w) => w[0])
          .join('')}
      </div>
      <div>
        <h3 className="font-display text-sm font-semibold text-white transition group-hover:text-team">
          {team.name}
        </h3>
        <p className="mt-0.5 text-xs text-white/40">{team.nationality}</p>
      </div>
    </Link>
  );
}
