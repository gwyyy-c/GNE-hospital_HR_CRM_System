// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT CONFIRMATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
function Logout({ user, onClose, onConfirm }) {
  const [phase, setPhase] = useState("idle"); // idle | busy | done

  const handleConfirm = async () => {
    setPhase("busy");
    await new Promise(r => setTimeout(r, 900));
    setPhase("done");
    setTimeout(onConfirm, 600);
  };

  const initials = (user?.name ?? "HR")
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        position:        "fixed",
        inset:           0,
        zIndex:          60,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        background:      "rgba(16,37,68,0.50)",
        backdropFilter:  "blur(4px)",
        fontFamily:      "'Inter', sans-serif",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background:   C.white,
          borderRadius: 20,
          boxShadow:    "0 24px 64px rgba(0,0,0,0.20)",
          width:        "100%",
          maxWidth:     420,
          overflow:     "hidden",
        }}
      >
        {/* Phase: spinning */}
        {phase === "busy" && (
          <div style={{ padding: "52px 40px", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              border: `4px solid ${C.tealTint}`,
              borderTopColor: C.teal,
              margin: "0 auto 20px",
              animation: "spin 0.8s linear infinite",
            }} />
            <div style={{ fontSize: 17, fontWeight: 600, color: C.navy }}>Signing out…</div>
            <div style={{ fontSize: 13, color: C.slate, marginTop: 4 }}>Clearing your session</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Phase: done */}
        {phase === "done" && (
          <div style={{ padding: "52px 40px", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: C.greenTint, display: "flex",
              alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <UserCheck size={30} style={{ color: C.green }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>Signed out</div>
            <div style={{ fontSize: 13, color: C.slate, marginTop: 4 }}>Redirecting to login…</div>
          </div>
        )}

        {/* Phase: idle confirmation */}
        {phase === "idle" && (
          <>
            {/* Header */}
            <div style={{
              padding:      "20px 24px 16px",
              borderBottom: `1px solid ${C.border}`,
              background:   C.pageBg,
              display:      "flex",
              alignItems:   "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: C.redTint, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <LogOut size={17} style={{ color: "#dc2626" }} />
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Sign Out</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: "none", background: "transparent",
                  cursor: "pointer", pointerEvents: "auto",
                  color: C.slate, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: "20px 24px 24px" }}>
              {/* User card */}
              <div style={{
                display:     "flex",
                alignItems:  "center",
                gap:         14,
                padding:     "14px 16px",
                borderRadius: 12,
                background:  C.pageBg,
                border:      `1px solid ${C.border}`,
                marginBottom: 16,
              }}>
                <span style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: C.teal, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: C.white, fontSize: 15, fontWeight: 700,
                }}>
                  {initials}
                </span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.navy }}>
                    {user?.name ?? "Admin"}
                  </div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: C.tealTint, color: C.teal,
                    fontSize: 11, fontWeight: 600,
                    padding: "2px 8px", borderRadius: 20, marginTop: 3,
                  }}>
                    <Building2 size={10} /> {user?.role ?? "Human Resources"}
                  </span>
                </div>
              </div>

              {/* Warning */}
              <div style={{
                display:     "flex",
                gap:         10,
                background:  C.amberTint,
                border:      "1px solid #fde68a",
                borderRadius: 10,
                padding:     "10px 14px",
                marginBottom: 20,
              }}>
                <ShieldAlert size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                  Any unsaved changes will be lost. Please save all records before signing out.
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1, padding: "11px 0", borderRadius: 10,
                    border: `2px solid ${C.border}`, background: C.white,
                    fontSize: 14, fontWeight: 600, color: C.gray,
                    cursor: "pointer", pointerEvents: "auto",
                    fontFamily: "inherit",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  style={{
                    flex: 1, padding: "11px 0", borderRadius: 10,
                    border: "none", background: "#dc2626",
                    fontSize: 14, fontWeight: 700, color: C.white,
                    cursor: "pointer", pointerEvents: "auto",
                    fontFamily: "inherit",
                    boxShadow: "0 4px 12px rgba(220,38,38,0.30)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                  }}
                >
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