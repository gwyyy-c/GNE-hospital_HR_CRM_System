import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  login,
  logout,
  getStoredToken,
  getStoredUser,
  isAuthenticated as checkAuth,
  ROLE_ROUTES,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Rehydrate from storage on first mount ──────────────────────────
  useEffect(() => {
    const initAuth = () => {
      if (checkAuth()) {
        setToken(getStoredToken());
        setUser(getStoredUser());
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // ── signIn wraps authService.login ───────────────────────────────────────
  const signIn = useCallback(async (credentials) => {
    try {
      const result = await login(credentials); 
      
      // Critical: Update local state immediately
      setToken(result.token);
      setUser(result.user);
      
      // Determine the path based on the role from the database
      const userRole = result.user.role || result.user.access_role;
      const redirectTo = ROLE_ROUTES[userRole] ?? "/dashboard";

      return { ...result, redirectTo }; 
    } catch (error) {
      // If the error is "Session expired" during a login attempt, 
      // it means the backend rejected the initial credentials.
      throw error;
    }
  }, []);

  // ── signOut ──────────────────────────────────────────────────────────────
  const signOut = useCallback(() => {
    logout();
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!token && !!user, // Check both for better security
    redirectPath: user 
      ? (ROLE_ROUTES[user.role || user.access_role] ?? "/dashboard") 
      : "/login",
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}