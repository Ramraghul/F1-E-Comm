import { DashboardShell, type DashboardNavItem } from './DashboardShell';

const NAV_ITEMS: DashboardNavItem[] = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/raceteams', label: 'Race Team Approvals' },
  { to: '/admin/teams', label: 'Teams' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/offers', label: 'Offers' },
  { to: '/admin/users', label: 'Users' },
];

export function AdminLayout() {
  return <DashboardShell title="Admin" subtitle="Site-wide oversight" navItems={NAV_ITEMS} />;
}
