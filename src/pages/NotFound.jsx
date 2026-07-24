import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-mist">This page went off-pipeline</h1>
      <p className="mt-2 max-w-sm text-sm text-slate">
        No agent found a route matching that URL. Let's get you back on track.
      </p>
      <Link to="/" className="btn-ember mt-6">
        Back to home
      </Link>
    </div>
  );
}
