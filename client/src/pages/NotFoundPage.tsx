import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-bold text-f1red">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-white">Off the Track</h1>
      <p className="mt-2 text-white/50">This page doesn&apos;t exist — let&apos;s get you back on the grid.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </div>
  );
}
