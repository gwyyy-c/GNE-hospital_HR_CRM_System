import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth }   from "./context/AuthContext";
import { LoadingProvider }         from "./context/LoadingContext";
import { SearchProvider }          from "./context/SearchContext";
import SecurityRoute               from "./components/auth/SecurityRoute";
import LoginPage                   from "./pages/Login";
import NotFound                    from "./pages/NotFound";
import Layout                      from "./components/Layout";
import HRDashboard                from "./pages/HRDashboard";
import DoctorDashboard            from "./pages/DoctorDashboard";
import FrontDeskDashboard         from "./pages/FrontDeskDashboard";

/**
 * Placeholder page for nested routes that don't have dedicated files yet.
 */
function DashboardPage({ title }) {
  const { user, signOut } = useAuth();
  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">
        {user?.department || "General"}
      </p>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">{title}</h1>
      <p className="text-gray-500 mb-8">
        Logged in as <strong>{user?.name}</strong> ({user?.role})
      </p>
      <button
        onClick={signOut}
        className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}

/**
 * RootRedirect handles the initial landing logic.
 * It checks if a session exists and sends the user to their specific dashboard.
 */
function RootRedirect() {
  const { isAuthenticated, redirectPath } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={redirectPath} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
        <LoadingProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Logic to redirect "/" to the right place */}
            <Route path="/" element={<RootRedirect />} />

            {/* ── Doctor Module Routes ── */}
            <Route element={<SecurityRoute allowedRoles={["Doctor"]} />}>
              <Route path="/doctor/*" element={
                <Layout role="Doctor">
                  <Routes>
                    <Route path="dashboard"     element={<DoctorDashboard />} />
                    <Route path="patients"      element={<DoctorDashboard />} />
                    <Route path="consultations" element={<DoctorDashboard />} />
                    <Route path="records"       element={<DoctorDashboard />} />
                    <Route path="*"             element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </Layout>
              } />
            </Route>

            {/* HR Module */}
            <Route element={<SecurityRoute allowedRoles={["HR"]} />}>
              <Route path="/hr/*" element={
                <Layout role="HR">
                  <Routes>
                    <Route path="dashboard"   element={<HRDashboard />} />
                    <Route path="employees"   element={<HRDashboard />} />
                    <Route path="departments" element={<HRDashboard />} />
                    <Route path="schedules"   element={<HRDashboard />} />
                    <Route path="recruitment" element={<HRDashboard />} />
                    <Route path="leave"       element={<HRDashboard />} />
                    <Route path="*"           element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </Layout>
              } />
            </Route>

            {/* Front Desk - PMS Module */}
            <Route element={<SecurityRoute allowedRoles={["FrontDesk"]} />}>
              <Route path="/pms/*" element={
                <Layout role="FrontDesk">
                  <Routes>
                    <Route path="dashboard"    element={<FrontDeskDashboard />} />
                    <Route path="patients"     element={<FrontDeskDashboard />} />
                    <Route path="appointments" element={<FrontDeskDashboard />} />
                    <Route path="admissions"   element={<FrontDeskDashboard />} />
                    <Route path="billing"      element={<FrontDeskDashboard />} />
                    <Route path="inquiries"    element={<FrontDeskDashboard />} />
                    <Route path="*"            element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </Layout>
              } />
            </Route>

            {/* Global Catch-all: show 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LoadingProvider>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}