 import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, Users, UserPlus, User,
  ClipboardList, Calendar, Settings, LogOut,
  Bell, Search, Menu, X, ChevronDown, Building2,
  ChevronsLeft, UserCheck, Clock, AlertTriangle,
  BedDouble, Stethoscope, FileText, Activity,
  TrendingUp, ShieldAlert, CheckCircle2, Info,
} from "lucide-react";

import { useAuth }   from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";

// 
// DESIGN TOKENS 
const C = {
  teal:      "#0E93B1",
  blue:      "#5390FB",
  navy:      "#102544",
  slate:     "#7794A7",
  green:     "#45A72D",
  pageBg:    "#F5F5F5",
  white:     "#FFFFFF",
  charcoal:  "#2E2E2E",
  gray:      "#636363",
  border:    "#E8E8E8",
  tealTint:  "#E6F5F9",
  greenTint: "#EBF5E7",
  blueTint:  "#EEF3FF",
  amberTint: "#FFFBEB",
  redTint:   "#FFF1F2",
};

// Role-based sidebar colors
const ROLE_COLORS = {
  HR:        { primary: "#0E93B1", hover: "rgba(255,255,255,0.12)", active: "rgba(255,255,255,0.18)" }, // Teal
  Doctor:    { primary: "#2E7D32", hover: "rgba(255,255,255,0.12)", active: "rgba(255,255,255,0.18)" }, // Green
  FrontDesk: { primary: "#1E3A5F", hover: "rgba(255,255,255,0.12)", active: "rgba(255,255,255,0.18)" }, // Navy Blue
};

// ROLE-BASED NAV CONFIG
const NAV_CONFIG = {
  HR: {
    basePath: "/hr",
    sections: [
      {
        heading: "OVERVIEW",
        links: [
          { id: "dashboard", label: "Dashboard",      Icon: LayoutDashboard },
        ],
      },
      {
        heading: "STAFF MANAGEMENT",
        links: [
          { id: "employees",   label: "All Employees",  Icon: Users         },
          { id: "recruitment", label: "Recruitment",    Icon: UserPlus      },
          { id: "leave",       label: "Leave Requests", Icon: ClipboardList },
          { id: "schedules",   label: "Schedules",      Icon: Calendar      },
        ],
      },
    ],
  },
  Doctor: {
    basePath: "/doctor",
    sections: [
      {
        heading: "OVERVIEW",
        links: [
          { id: "dashboard",     label: "Dashboard",        Icon: LayoutDashboard },
          { id: "patients",      label: "My Patients",      Icon: Users           },
          { id: "consultations", label: "Consultations",    Icon: Stethoscope     },
        ],
      },
      {
        heading: "RECORDS",
        links: [
          { id: "records",       label: "Medical Records",  Icon: FileText     },
        ],
      },
    ],
  },
  FrontDesk: {
    basePath: "/pms",
    sections: [
      {
        heading: "OVERVIEW",
        links: [
          { id: "dashboard",    label: "Dashboard",    Icon: LayoutDashboard },
          { id: "patients",     label: "Patients",     Icon: Users           },
          { id: "appointments", label: "Appointments", Icon: Calendar        },
          { id: "admissions",   label: "Admissions",   Icon: BedDouble       },
          { id: "billing",      label: "Billing",      Icon: FileText        },
          { id: "inquiries",    label: "Inquiries",    Icon: ClipboardList   },
        ],
      },
    ],
  },
};

// 
// Sample notifications (replace with a real API call when backend is ready)
// 
const SAMPLE_NOTIFICATIONS = [
  { id: 1, type: "info",    title: "Leave request submitted",     body: "James Reyes submitted a leave request.",   time: "2m ago",  read: false },
  { id: 2, type: "warning", title: "Shift coverage gap",          body: "ICU night shift has no coverage on Fri.",  time: "1h ago",  read: false },
  { id: 3, type: "success", title: "Employee profile updated",    body: "Dr. Emily Chen's record was updated.",     time: "3h ago",  read: true  },
  { id: 4, type: "info",    title: "New recruitment application", body: "3 new applicants for Nurse position.",     time: "1d ago",  read: true  },
];

const NOTIF_ICONS = {
  info:    <Info      className="w-4 h-4 text-blue-500"   />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  success: <CheckCircle2  className="w-4 h-4 text-green-500" />,
};

// 
// SIDEBAR
// 
function Sidebar({ navConfig, activeId, onNavigate, onLogout, collapsed, onToggle, role = "HR" }) {
  const colors = ROLE_COLORS[role] ?? ROLE_COLORS.HR;
  return (
    <aside
      style={{
        width:         collapsed ? 68 : 256,
        minWidth:      collapsed ? 68 : 256,
        maxWidth:      collapsed ? 68 : 256,
        flexShrink:    0,
        height:        "100vh",
        background:    colors.primary,
        display:       "flex",
        flexDirection: "column",
        position:      "relative",
        zIndex:        30,
        overflow:      "hidden",
        transition:    "width 220ms cubic-bezier(.4,0,.2,1), min-width 220ms cubic-bezier(.4,0,.2,1)",
        boxShadow:     "2px 0 16px rgba(14,147,177,0.18)",
        fontFamily:    "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          height:         64,
          display:        "flex",
          alignItems:     "center",
          gap:            12,
          padding:        collapsed ? "0 16px" : "0 20px",
          borderBottom:   "1px solid rgba(255,255,255,0.15)",
          flexShrink:     0,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <span
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: C.white, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: C.teal,
          }}
        >
          <img className="w-full h-full object-contain" src="/hospital_logo.png" alt="GNE" />
        </span>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ color: C.white, fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
              GNE Medical Hospital
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {navConfig.basePath.replace("/", "").toUpperCase() + " PORTAL"}
            </div>
          </div>
        )}
      </div>

      <nav
        style={{
          flex: 1, overflowY: "auto", padding: "16px 10px",
          scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.2) transparent",
        }}
      >
        {navConfig.sections.map(({ heading, links }) => (
          <div key={heading} style={{ marginBottom: 24 }}>
            {!collapsed && (
              <div style={{ color: "rgba(255,255,255,0.40)", fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", padding: "0 10px", marginBottom: 6 }}>
                {heading}
              </div>
            )}
            {links.map(({ id, label, Icon }) => {
              const active = activeId === id;
              return (
                <button
                  key={id}
                  type="button"
                  title={collapsed ? label : undefined}
                  onClick={() => onNavigate(`${navConfig.basePath}/${id}`)}
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    gap:            collapsed ? 0 : 12,
                    justifyContent: collapsed ? "center" : "flex-start",
                    width:          "100%",
                    padding:        collapsed ? "11px 0" : "10px 12px",
                    borderRadius:   10,
                    border:         "none",
                    cursor:         "pointer",
                    pointerEvents:  "auto",
                    background:     active ? "rgba(255,255,255,0.20)" : "transparent",
                    color:          active ? C.white : "rgba(255,255,255,0.65)",
                    fontWeight:     active ? 600 : 400,
                    fontSize:       14,
                    marginBottom:   2,
                    position:       "relative",
                    transition:     "background 150ms",
                    fontFamily:     "inherit",
                    textAlign:      "left",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.10)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  {active && (
                    <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 22, borderRadius: "0 3px 3px 0", background: C.white }} />
                  )}
                  <Icon size={17} style={{ flexShrink: 0 }} />
                  {!collapsed && <span>{label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: "10px", borderTop: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }}>
        {[
          { id: "logout",   label: "Logout",   Icon: LogOut,   action: onLogout, danger: true  },
        ].map(({ id, label, Icon, action, danger }) => (
          <button
            key={id}
            type="button"
            title={collapsed ? label : undefined}
            onClick={action}
            style={{
              display:        "flex",
              alignItems:     "center",
              gap:            collapsed ? 0 : 12,
              justifyContent: collapsed ? "center" : "flex-start",
              width:          "100%",
              padding:        collapsed ? "11px 0" : "10px 12px",
              borderRadius:   10,
              border:         "none",
              cursor:         "pointer",
              pointerEvents:  "auto",
              background:     "transparent",
              color:          danger ? "rgba(255,180,180,0.85)" : "rgba(255,255,255,0.65)",
              fontSize:       14,
              fontWeight:     400,
              marginBottom:   2,
              transition:     "background 150ms, color 150ms",
              fontFamily:     "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = danger ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.10)";
              e.currentTarget.style.color      = danger ? "#fca5a5"              : C.white;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color      = danger ? "rgba(255,180,180,0.85)" : "rgba(255,255,255,0.65)";
            }}
          >
            <Icon size={17} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onToggle}
        style={{
          position: "absolute", right: -12, top: 72,
          width: 24, height: 24, borderRadius: "50%",
          background: C.white, border: `1px solid ${C.border}`,
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", pointerEvents: "auto", zIndex: 40,
        }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronsLeft size={13} style={{ color: "#666", transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 220ms" }} />
      </button>
    </aside>
  );
}

// 
// NOTIFICATION PANEL
// 
function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const unread = notifications.filter((n) => !n.read).length;

  const markAll = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismiss = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 25 }} onClick={onClose} />
      <div
        style={{
          position: "absolute", right: 0, top: 48, width: 340,
          background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.14)", zIndex: 35, overflow: "hidden",
          fontFamily: "inherit",
        }}
      >
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Notifications</span>
            {unread > 0 && (
              <span style={{ background: C.teal, color: C.white, fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 20 }}>{unread}</span>
            )}
          </div>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAll}
              style={{ fontSize: 12, color: C.teal, fontWeight: 600, border: "none", background: "transparent", cursor: "pointer", pointerEvents: "auto" }}
            >
              Mark all read
            </button>
          )}
        </div>
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <div style={{ padding: "28px 16px", textAlign: "center", color: C.slate, fontSize: 13 }}>No notifications</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 16px",
                  background: n.read ? "transparent" : C.tealTint,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <span style={{ marginTop: 2, flexShrink: 0 }}>{NOTIF_ICONS[n.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.4 }}>{n.body}</div>
                  <div style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>{n.time}</div>
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(n.id)}
                  style={{ color: C.slate, background: "transparent", border: "none", cursor: "pointer", pointerEvents: "auto", padding: 2 }}
                >
                  <X size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// 
// TOPBAR
// 
function Topbar({ user, onLogout, onMobileMenu }) {
  const [bellOpen, setBellOpen] = useState(false);
  const { query, setQuery }     = useSearch();

  const unreadCount = SAMPLE_NOTIFICATIONS.filter((n) => !n.read).length;
  
  const initials = (user?.name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      style={{
        height: 64, background: C.white, borderBottom: `1px solid ${C.border}`,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 24px", flexShrink: 0,
        position: "relative", zIndex: 20, fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          type="button"
          onClick={onMobileMenu}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 8, border: "none",
            background: "transparent", cursor: "pointer", pointerEvents: "auto", color: C.gray,
          }}
          className="lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.pageBg, borderRadius: 12, padding: "8px 14px", width: 260 }}>
          <Search size={15} style={{ color: C.slate, flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything"
            style={{ background: "transparent", border: "none", outline: "none", fontSize: 14, color: C.charcoal, width: "100%", fontFamily: "inherit" }}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")}
              style={{ background: "transparent", border: "none", cursor: "pointer", pointerEvents: "auto", color: C.slate, padding: 0, display: "flex" }}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setBellOpen((p) => !p)}
            style={{
              position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 10, border: "none",
              background: bellOpen ? C.tealTint : "transparent",
              cursor: "pointer", pointerEvents: "auto", color: C.gray, transition: "background 150ms",
            }}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, borderRadius: "50%", background: "#ef4444", border: `2px solid ${C.white}` }} />
            )}
          </button>
          {bellOpen && <NotificationPanel onClose={() => setBellOpen(false)} />}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: C.border }} />

        {/* User Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ 
            width: 32, height: 32, borderRadius: 9, background: C.teal, 
            display: "flex", alignItems: "center", justifyContent: "center", 
            color: C.white, fontSize: 12, fontWeight: 700, flexShrink: 0 
          }}>
            {initials}
          </span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.charcoal, lineHeight: 1.2 }}>{user?.name ?? "Admin"}</div>
            <div style={{ fontSize: 10, color: C.teal, fontWeight: 500 }}>{user?.role ?? "Staff"}</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
            borderRadius: 10, border: "none", background: C.redTint, color: "#dc2626",
            fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 150ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = C.redTint; }}
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </header>
  );
}

// 
// LOGOUT CONFIRMATION MODAL
// 
function LogoutModal({ user, onClose, onConfirm }) {
  const [phase, setPhase] = useState("idle");

  const handleConfirm = async () => {
    setPhase("busy");
    await new Promise((r) => setTimeout(r, 700));
    setPhase("done");
    setTimeout(onConfirm, 500);
  };

  const initials = (user?.name ?? "HR")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(16,37,68,0.50)", backdropFilter: "blur(4px)", fontFamily: "'Inter', sans-serif" }}
      onClick={(e) => { if (e.target === e.currentTarget && phase === "idle") onClose(); }}
    >
      <div style={{ background: C.white, borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,0.20)", width: "100%", maxWidth: 420, overflow: "hidden" }}>
        {phase === "busy" && (
          <div style={{ padding: "52px 40px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: `4px solid ${C.border}`, borderTopColor: C.teal, margin: "0 auto 20px", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: 17, fontWeight: 600, color: C.navy }}>Signing out</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        {phase === "done" && (
          <div style={{ padding: "52px 40px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.greenTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <UserCheck size={30} style={{ color: C.green }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>Signed out</div>
            <div style={{ fontSize: 13, color: C.slate, marginTop: 4 }}>Redirecting to login</div>
          </div>
        )}
        {phase === "idle" && (
          <>
            <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, background: C.pageBg, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: C.redTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LogOut size={17} style={{ color: "#dc2626" }} />
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Sign Out</span>
              </div>
              <button type="button" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", pointerEvents: "auto", color: C.slate, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: "20px 24px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: C.pageBg, border: `1px solid ${C.border}`, marginBottom: 16 }}>
                <span style={{ width: 44, height: 44, borderRadius: 10, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: 15, fontWeight: 700 }}>
                  {initials}
                </span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.navy }}>{user?.name ?? "Admin"}</div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.tealTint, color: C.teal, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, marginTop: 3 }}>
                    <Building2 size={10} /> {user?.role ?? "Staff"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, background: C.amberTint, border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
                <ShieldAlert size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.5 }}>Any unsaved changes will be lost. Please save all records before signing out.</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={onClose}
                  style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `2px solid ${C.border}`, background: C.white, fontSize: 14, fontWeight: 600, color: C.gray, cursor: "pointer", pointerEvents: "auto", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button type="button" onClick={handleConfirm}
                  style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "#dc2626", fontSize: 14, fontWeight: 700, color: C.white, cursor: "pointer", pointerEvents: "auto", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(220,38,38,0.30)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// 
// LAYOUT SHELL (default export)
// 
export default function Layout({ role = "HR", children }) {
  const { user, signOut }       = useAuth();
  const navigate                = useNavigate();
  const location                = useLocation();
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const navConfig = NAV_CONFIG[role] ?? NAV_CONFIG.HR;

  // Derive active nav id from the last URL path segment
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const activeId     = pathSegments[pathSegments.length - 1] || "dashboard";

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogoutConfirm = () => {
    setLogoutOpen(false);
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { height: 100%; margin: 0; padding: 0; }
        body { background: ${C.pageBg}; font-family: 'Inter', sans-serif; overflow: hidden; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "row", height: "100vh", width: "100vw", overflow: "hidden", background: C.pageBg, fontFamily: "'Inter', sans-serif" }}>

        <div style={{ flexShrink: 0 }} className="hidden lg:flex">
          <Sidebar navConfig={navConfig} activeId={activeId} onNavigate={handleNavigate} onLogout={() => setLogoutOpen(true)} collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} role={role} />
        </div>

        {mobileOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50 }} className="lg:hidden">
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={() => setMobileOpen(false)} />
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: 320, zIndex: 51 }}>
              <button type="button" onClick={() => setMobileOpen(false)}
                style={{ position: "absolute", top: 14, right: 14, zIndex: 52, width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.15)", border: "none", color: C.white, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", pointerEvents: "auto" }}>
                <X size={16} />
              </button>
              <Sidebar navConfig={navConfig} activeId={activeId} onNavigate={handleNavigate} onLogout={() => { setMobileOpen(false); setLogoutOpen(true); }} collapsed={false} onToggle={() => setMobileOpen(false)} role={role} />
            </div>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Topbar user={user} onLogout={() => setLogoutOpen(true)} onMobileMenu={() => setMobileOpen(true)} />
          <main style={{ flex: 1, overflowY: "auto", padding: "28px", background: C.pageBg }}>
            {children}
          </main>
        </div>
      </div>

      {logoutOpen && (
        <LogoutModal user={user} onClose={() => setLogoutOpen(false)} onConfirm={handleLogoutConfirm} />
      )}
    </>
  );
}
