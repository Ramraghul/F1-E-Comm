import { DashboardShell, type DashboardNavItem } from './DashboardShell';
import { useAuth } from '../features/auth/useAuth';
import { teamStyleVars } from '../lib/teamTheme';

const NAV_ITEMS: DashboardNavItem[] = [
  { to: '/raceteam', label: 'Overview', end: true },
  { to: '/raceteam/products', label: 'Products' },
  { to: '/raceteam/offers', label: 'Offers' },
  { to: '/raceteam/orders', label: 'Orders' },
];

export function RaceTeamLayout() {
  const { user } = useAuth();
  const team = user?.team && typeof user.team === 'object' ? user.team : null;
  const style = teamStyleVars(team ? { colorPrimary: team.colorPrimary ?? '#E10600' } : null);

  return (
    <DashboardShell
      title="Race Team"
      subtitle={team?.name ?? 'Team dashboard'}
      navItems={NAV_ITEMS}
      accent={team?.colorPrimary ?? '#E10600'}
      style={style}
    />
  );
}
