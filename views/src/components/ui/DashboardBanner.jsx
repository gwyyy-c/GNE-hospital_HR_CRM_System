import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";

// Role-based banner colors
const ROLE_STYLES = {
  HR: {
    gradient: "linear-gradient(135deg, #0E93B1 0%, #0A7A94 100%)",
    
  },
  Doctor: {
    gradient: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
  },
  FrontDesk: {
    gradient: "linear-gradient(135deg, #1E3A5F 0%, #152C4A 100%)",
  },
};

export default function DashboardBanner() {
  const { user } = useAuth();
  
  const formattedDate = useMemo(() => {
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }, []);

  const roleStyle = ROLE_STYLES[user?.role] ?? ROLE_STYLES.HR;
  const userName = user?.name ?? "User";
  const userRole = user?.role ?? "Staff";

  return (
    <div
      style={{
        background: roleStyle.gradient,
        borderRadius: 16,
        padding: "24px 28px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 24 }}>{roleStyle.icon}</span>
          <h1 style={{ 
            margin: 0, 
            fontSize: 22, 
            fontWeight: 700, 
            color: "#fff",
            fontFamily: "'Inter', sans-serif",
          }}>
            Welcome, {userRole} {userName}
          </h1>
        </div>
        <p style={{ 
          margin: 0, 
          fontSize: 14, 
          color: "rgba(255,255,255,0.85)",
          fontFamily: "'Inter', sans-serif",
        }}>
          {formattedDate}
        </p>
      </div>
    </div>
  );
}
