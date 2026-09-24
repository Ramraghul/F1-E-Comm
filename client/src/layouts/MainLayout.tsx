import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { ToastStack } from '../components/ToastStack';

export function MainLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  // MainLayout stays mounted across route changes, so cartOpen would otherwise persist
  // through any navigation that doesn't go through one of the drawer's own links (e.g.
  // a redirect to /login, browser back/forward, or a navbar link clicked while the
  // drawer happens to be open) — close it on every route change instead.
  useEffect(() => {
    setCartOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onCartClick={() => setCartOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <ToastStack />
    </div>
  );
}
