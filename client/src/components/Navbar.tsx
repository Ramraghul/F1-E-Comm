import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useLogoutMutation } from '../features/auth/authApi';
import { loggedOut } from '../features/auth/authSlice';
import { useAppDispatch } from '../app/hooks';
import { useCartSummary } from '../features/cart/useCartSummary';
import { useWishlist } from '../features/wishlist/useWishlist';
import { useListTeamsQuery } from '../features/teams/teamsApi';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `font-display text-sm font-semibold uppercase tracking-wide transition hover:text-white ${
    isActive ? 'text-white' : 'text-white/55'
  }`;

export function Navbar({ onCartClick }: { onCartClick: () => void }) {
  const { isAuthenticated, user } = useAuth();
  const { count } = useCartSummary();
  const { count: wishlistCount } = useWishlist();
  const { data: teamsData } = useListTeamsQuery();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [teamsOpen, setTeamsOpen] = useState(false);

  async function handleLogout() {
    await logout().catch(() => undefined);
    dispatch(loggedOut());
    setMenuOpen(false);
    navigate('/');
  }

  const dashboardLink =
    user?.role === 'admin' ? '/admin' : user?.role === 'raceteam' ? '/raceteam' : '/account';

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-base-900/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-f1red shadow-glow">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M3 5h14l3 3-3 3H9l-2 3H3z" />
            </svg>
          </span>
          Shop<span className="text-f1red">Swift</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setTeamsOpen(true)}
            onMouseLeave={() => setTeamsOpen(false)}
          >
            <NavLink to="/teams" className={navLinkClass}>
              Teams
            </NavLink>
            {teamsOpen && teamsData && (
              <div className="absolute left-1/2 top-full grid w-[36rem] -translate-x-1/2 grid-cols-2 gap-1 rounded-lg border border-white/10 bg-base-850 p-3 pt-4 shadow-xl">
                {teamsData.data.map((team) => (
                  <Link
                    key={team.id}
                    to={`/teams/${team.slug}`}
                    className="flex items-center gap-2 rounded px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: team.colorPrimary }}
                    />
                    {team.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <NavLink to="/products" className={navLinkClass}>
            Shop
          </NavLink>
          <NavLink to="/offers" className={navLinkClass}>
            Offers
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/account/wishlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-white/80 transition hover:border-white/30 hover:text-white"
            aria-label="Open wishlist"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path
                d="M12 20.5S3.5 15.36 3.5 9.36A4.86 4.86 0 0 1 8.36 4.5c1.69 0 3.19.86 4.14 2.16A5.02 5.02 0 0 1 16.14 4.5a4.86 4.86 0 0 1 4.86 4.86c0 6-8.5 11.14-8.5 11.14Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isAuthenticated && wishlistCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-f1red px-1 text-[11px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={onCartClick}
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-white/80 transition hover:border-white/30 hover:text-white"
            aria-label="Open cart"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.4" fill="currentColor" />
              <circle cx="17" cy="20" r="1.4" fill="currentColor" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-f1red px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-base-700 font-display text-sm font-bold text-white"
              >
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 w-52 rounded-lg border border-white/10 bg-base-850 py-2 shadow-xl">
                  <p className="truncate px-4 pb-2 text-xs text-white/40">{user?.email}</p>
                  <Link
                    to={dashboardLink}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5"
                  >
                    {user?.role === 'user' ? 'My Account' : 'Dashboard'}
                  </Link>
                  {user?.role === 'user' && (
                    <Link
                      to="/account/orders"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5"
                    >
                      My Orders
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-f1red-light hover:bg-white/5"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn-outline px-4 py-2 text-xs">
                Log In
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-xs">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
