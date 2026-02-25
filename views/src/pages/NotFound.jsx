// src/pages/NotFound.jsx
// 404 error page shown when users navigate to non-existent routes.

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-surface-900">404</h1>
        <p className="mb-6 text-xl text-surface-500">Page not found</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
