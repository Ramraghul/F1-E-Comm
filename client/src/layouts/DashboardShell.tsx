import type { CSSProperties, ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ToastStack } from '../components/ToastStack';
import { useLogoutMutation } from '../features/auth/authApi';
import { loggedOut } from '../features/auth/authSlice';
import { useAppDispatch } from '../app/hooks';
import { useAuth } from '../features/auth/useAuth';

export interface DashboardNavItem {
  to: string;
  label: string;
  end?: boolean;
}

export function DashboardShell({
  title,
  subtitle,
  navItems,
  accent = 'var(--team-primary, #E10600)',
  style,
}: {
  title: string;
  subtitle?: ReactNode;
  navItems: DashboardNavItem[];
  accent?: string;
  style?: CSSProperties;
}) {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  async function handleLogout() {
    await logout().catch(() => undefined);
    dispatch(loggedOut());
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-base-900" style={style}>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-base-950 px-4 py-6 md:flex">
        <p className="mb-8 px-2 font-display text-lg font-bold text-white">
          Shop<span style={{ color: accent }}>Swift</span>
        </p>
        <p className="mb-1 px-2 font-display text-xs font-bold uppercase tracking-widest text-white/40">
          {title}
        </p>
        {subtitle && <p className="mb-6 px-2 text-xs text-white/30">{subtitle}</p>}
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2.5 font-display text-sm font-semibold transition ${
                  isActive ? 'text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`
              }
              style={({ isActive }) => (isActive ? { background: `${accent}20`, color: 'white' } : {})}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 overflow-x-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-base-950/60 px-4 py-3 sm:px-6">
          <p className="font-display text-sm font-bold text-white md:hidden">{title}</p>
          <p className="hidden truncate text-xs text-white/40 md:block">{user?.email}</p>
          <button type="button" onClick={handleLogout} className="btn-outline ml-auto px-4 py-1.5 text-xs">
            Log out
          </button>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Outlet />
        </div>
      </div>
      <ToastStack />
    </div>
  );
}
