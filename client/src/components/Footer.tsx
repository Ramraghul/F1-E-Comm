import { Link } from 'react-router-dom';

// Swagger is served by the API, not the SPA — derive its origin from the API base URL so
// this resolves correctly whether the API is on localhost, Render, or same-origin behind a proxy.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';
const SWAGGER_URL = `${new URL(API_BASE, window.location.origin).origin}/api-docs`;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-base-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="font-display text-lg font-bold text-white">
              Shop<span className="text-f1red">Swift</span>
            </p>
            <p className="mt-2 max-w-xs text-sm text-white/40">
              Official-style merchandise from every team on the grid. A full-stack portfolio project —
              not an official Formula 1 storefront.
            </p>
          </div>
          <div>
            <h4 className="label">Shop</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link to="/products" className="hover:text-white">All Products</Link></li>
              <li><Link to="/teams" className="hover:text-white">Teams</Link></li>
              <li><Link to="/offers" className="hover:text-white">Offers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="label">Account</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link to="/login" className="hover:text-white">Log In</Link></li>
              <li><Link to="/register" className="hover:text-white">Create Account</Link></li>
              <li><Link to="/register/raceteam" className="hover:text-white">Sell as a Race Team</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="label">Developer</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><a href={SWAGGER_URL} target="_blank" rel="noreferrer" className="hover:text-white">API Docs (Swagger)</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-white/5 pt-6 text-xs text-white/30">
          © {new Date().getFullYear()} Shop Swift. Portfolio project — all team names/colors used for demonstration only.
        </p>
      </div>
    </footer>
  );
}
