// src/components/Auth/ProtectedRoute.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Usage (React Router v6):
//
//   <Route element={<ProtectedRoute allowedRoles={["Doctor"]} />}>
//     <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
//   </Route>
//
// If not authenticated → redirect to /login
// If authenticated but wrong role → redirect to their own dashboard
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLE_ROUTES } from "../../services/authService";

export default function SecurityRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Brief loading state while rehydrating session
    return (
      <div className="flex h-screen items-center justify-center bg-surface-50">
        <span className="animate-pulse text-sm font-medium text-surface-400">
          Checking session…
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    // Redirect to the dashboard the user IS allowed to see
    return <Navigate to={ROLE_ROUTES[user.role] ?? "/login"} replace />;
  }

  return <Outlet />;
}