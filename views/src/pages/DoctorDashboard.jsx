/**
 * @package   hr-pms-frontend
 * @category  Page Component - Doctor Dashboard
 * @desc      Main dashboard for doctors to view appointments, patients, and medical records
 */
import { useMemo, useState, useCallback } from "react";
import { useDoctorStore } from "../hooks/useDoctorStore";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import { useLocation } from "react-router-dom";
import { CalendarCheck, Clock, CheckCircle, Users, Eye, X, Phone, Mail, MapPin, Calendar, Droplet, AlertCircle, Plus, FileText } from "lucide-react";
import DashboardBanner from "../components/ui/DashboardBanner";
import AddMedicalRecordModal from "../components/Doctor/AddMedicalRecord";

// Doctor theme colors (green-based for medical professional branding)
const C = {
  primary:     "#2E7D32",  // Doctor green
  primaryTint: "#E8F5E9",
  teal:        "#0e93b1",
  blue:        "#5390FB",
  navy:        "#102544",
  slate:       "#7794A7",
  green:       "#45A72D",
  pageBg:      "#F5F5F5",
  white:       "#FFFFFF",
  charcoal:    "#2E2E2E",
  gray:        "#636363",
  border:      "#E8E8E8",
  tealTint:    "#E6F5F9",
  greenTint:   "#EBF5E7",
  blueTint:    "#EEF3FF",
  amberTint:   "#FFFBEB",
  redTint:     "#FFF1F2",
};

// CARDS
const Card = ({ children, style = {} }) => (
  <div style={{
    background:   C.white,
    borderRadius: 14,
    border:       `1px solid ${C.border}`,
    boxShadow:    "0 2px 8px rgba(0,0,0,0.06)",
    overflow:     "hidden",
    ...style,
  }}>
    {children}
  </div>
);

const CardHeader = ({ title, sub, action }) => (
  <div style={{
    padding:        "18px 20px 14px",
    borderBottom:   `1px solid ${C.border}`,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
  }}>
    <div>
      <div style={{ fontSize: 16, fontWeight: 600, color: C.navy }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { query: searchQuery } = useSearch();
  const [viewingPatient, setViewingPatient] = useState(null);
  const [showAddRecord, setShowAddRecord] = useState(false);

  // Callback to refresh data after adding a record
  const handleRecordSaved = useCallback(() => {
    // Force reload by refreshing the page or use store refresh
    window.location.reload();
  }, []);

  // Determine active tab from URL path (only dashboard, patients, consultations, records)
  const activeTab = pathname.includes("patients")      ? "patients"
                  : pathname.includes("consultations") ? "consultations"
                  : pathname.includes("records")       ? "records"
                  : "dashboard";

  // Safely destructure with fallbacks in case the hook returns null/undefined
  const store = useDoctorStore() ?? {};
  const appointmentsRaw   = Array.isArray(store.appointments)   ? store.appointments   : [];
  const patientsRaw       = Array.isArray(store.patients)       ? store.patients       : [];
  const medicalRecordsRaw = Array.isArray(store.medicalRecords) ? store.medicalRecords : [];
  const loading        = store.loading ?? false;
  const error          = store.error   ?? null;

  // Search filtering
  const searchLower = searchQuery?.toLowerCase() ?? "";
  
  const appointments = useMemo(() => {
    if (!searchLower) return appointmentsRaw;
    return appointmentsRaw.filter(apt => {
      const patient = (apt.patient_name ?? apt.patient ?? "").toLowerCase();
      const status = (apt.status ?? "").toLowerCase();
      return patient.includes(searchLower) || status.includes(searchLower);
    });
  }, [appointmentsRaw, searchLower]);

  const patients = useMemo(() => {
    if (!searchLower) return patientsRaw;
    return patientsRaw.filter(pat => {
      const name = `${pat.first_name ?? ""} ${pat.last_name ?? ""} ${pat.name ?? ""}`.toLowerCase();
      const id = (pat.patient_id_display ?? "").toLowerCase();
      return name.includes(searchLower) || id.includes(searchLower);
    });
  }, [patientsRaw, searchLower]);

  const medicalRecords = useMemo(() => {
    if (!searchLower) return medicalRecordsRaw;
    return medicalRecordsRaw.filter(rec => {
      const patient = (rec.patient_name ?? "").toLowerCase();
      const diagnosis = (rec.diagnosis ?? "").toLowerCase();
      return patient.includes(searchLower) || diagnosis.includes(searchLower);
    });
  }, [medicalRecordsRaw, searchLower]);

  // KPI statistics for the dashboard (with icons for visual clarity)
  const kpis = [
    { label: "Total Appointments", value: appointments.length,                                            delta: "Today",         accent: C.primary, Icon: CalendarCheck },
    { label: "Waiting",            value: appointments.filter(a => a.status === "waiting" || a.status === "Pending").length,        delta: "In queue",      accent: C.teal,    Icon: Clock         },
    { label: "Completed",          value: appointments.filter(a => a.status === "completed" || a.status === "Completed").length,      delta: "Done today",    accent: C.green,   Icon: CheckCircle   },
    { label: "My Patients",        value: patients.length,                                                delta: "Under my care", accent: "#8b5cf6", Icon: Users         },
  ];

  // Loading state
  if (loading) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", padding: 40, textAlign: "center", color: C.slate }}>
        Loading dashboard...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", padding: 40, textAlign: "center", color: "#dc2626" }}>
        Failed to load dashboard: {error?.message ?? String(error)}
      </div>
    );
  }

  // Page titles based on active tab
  const pageTitles = {
    dashboard:     "Doctor Dashboard",
    patients:      "My Patients",
    consultations: "Consultations",
    records:       "Medical Records",
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Welcome Banner */}
      <DashboardBanner />

      {/* KPI row - show only on dashboard */}
      {activeTab === "dashboard" && (
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap:                 16,
          marginBottom:        24,
        }}>
          {kpis.map(({ label, value, delta, accent, Icon }) => (
            <div key={label} style={{
              background:   C.white,
              borderRadius: 14,
              border:       `1px solid ${C.border}`,
              boxShadow:    "0 2px 8px rgba(0,0,0,0.06)",
              padding:      "20px",
            }}>
              <span style={{
                width: 40, height: 40, borderRadius: 10,
                background: accent, display: "flex",
                alignItems: "center", justifyContent: "center",
                marginBottom: 14,
                color: C.white,
              }}>
                <Icon size={20} />
              </span>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.navy, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 13, color: C.gray, marginTop: 5 }}>{label}</div>
              <div style={{ fontSize: 11, color: accent, fontWeight: 600, marginTop: 6 }}>{delta}</div>
            </div>
          ))}
        </div>
      )}

      {/* Dashboard View - Today's Appointments */}
      {activeTab === "dashboard" && (
        <div style={{ marginBottom: 24 }}>
          {/* Today's Appointments */}
          <Card>
            <CardHeader title="Today's Appointments" sub="Patient consultations" />
            <div style={{ overflowX: "auto" }}>
              {appointments.length === 0 ? (
                <p style={{ color: C.slate, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No appointments today.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: C.pageBg }}>
                      {["Appt ID", "Patient ID", "Patient", "Time", "Status"].map(h => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.slate }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, 5).map((apt, i) => (
                      <tr key={apt.id ?? i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "10px 12px", fontSize: 11, color: C.slate, fontFamily: "monospace" }}>
                          {apt.appt_id_display ?? `APT-${String(apt.id ?? i).padStart(4, "0")}`}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 11, color: C.primary, fontWeight: 700, fontFamily: "monospace" }}>
                          {apt.patient_id_display ?? `PAT-${String(apt.patient_id ?? "?").padStart(3, "0")}`}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: C.navy, fontWeight: 600 }}>
                          {apt.patient_name ?? apt.patient ?? "Unknown"}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: C.gray }}>
                          {apt.appt_date ? new Date(apt.appt_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : apt.time ?? ""}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{
                            padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700,
                            background: apt.status === "Completed" ? C.greenTint : C.amberTint,
                            color: apt.status === "Completed" ? C.green : "#d97706",
                          }}>{apt.status ?? "Pending"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Dashboard View - My Patients summary */}
      {activeTab === "dashboard" && (
        <Card>
          <CardHeader title="My Patients" sub="Current patients under care" />
          <div style={{ overflowX: "auto" }}>
            {patients.length === 0 ? (
              <p style={{ color: C.slate, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No patients assigned.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.pageBg }}>
                    {["Patient ID", "Name", "Age", "Gender", "Contact", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.slate }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, 5).map((pat, i) => {
                    const patName = pat.first_name && pat.last_name 
                      ? `${pat.first_name} ${pat.last_name}` 
                      : pat.name ?? "Unknown";
                    const patAge = pat.age ?? (pat.dob ? Math.floor((new Date() - new Date(pat.dob)) / 31536000000) : "-");
                    return (
                      <tr key={pat.id ?? i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.primary, fontWeight: 700, fontFamily: "monospace" }}>
                          PAT-{String(pat.id ?? i).padStart(3, "0")}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: C.navy, fontWeight: 600 }}>{patName}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: C.charcoal }}>{patAge}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: C.charcoal }}>{pat.gender ?? "-"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: C.charcoal }}>{pat.contact_no ?? pat.phone ?? "-"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: C.greenTint, color: C.green,
                          }}>Active</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* Patients Tab - Full patient list */}
      {activeTab === "patients" && (
        <Card>
          <CardHeader title="All My Patients" sub="Complete patient list" />
          <div style={{ overflowX: "auto" }}>
            {patients.length === 0 ? (
              <p style={{ color: C.slate, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No patients assigned.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.pageBg }}>
                    {["Patient ID", "Name", "Age", "Date of Birth", "Gender", "Contact", "Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.slate }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {patients.map((pat, i) => {
                    const patName = pat.first_name && pat.last_name 
                      ? `${pat.first_name} ${pat.last_name}` 
                      : pat.name ?? "Unknown";
                    const patAge = pat.age ?? (pat.dob ? Math.floor((new Date() - new Date(pat.dob)) / 31536000000) : "-");
                    return (
                      <tr key={pat.id ?? i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.primary, fontWeight: 700, fontFamily: "monospace" }}>
                          PAT-{String(pat.id ?? i).padStart(3, "0")}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: C.navy, fontWeight: 600 }}>{patName}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: C.charcoal }}>{patAge}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray }}>
                          {pat.dob ? new Date(pat.dob).toLocaleDateString() : "-"}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: C.charcoal }}>{pat.gender ?? "-"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: C.charcoal }}>{pat.contact_no ?? pat.phone ?? "-"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            onClick={() => setViewingPatient(pat)}
                            style={{
                              display: "flex", alignItems: "center", gap: 4, padding: "6px 12px",
                              borderRadius: 8, border: `1px solid ${C.primary}`, background: C.primaryTint,
                              color: C.primary, fontSize: 11, fontWeight: 600, cursor: "pointer",
                            }}
                          >
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* Consultations Tab */}
      {activeTab === "consultations" && (
        <Card>
          <CardHeader title="Consultations" sub="All appointments and consultations" />
          <div style={{ overflowX: "auto" }}>
            {appointments.length === 0 ? (
              <p style={{ color: C.slate, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No consultations found.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.pageBg }}>
                    {["Appt ID", "Patient ID", "Patient Name", "Date", "Time", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.slate }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt, i) => (
                    <tr key={apt.id ?? i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: C.slate, fontFamily: "monospace" }}>
                        APT-{String(apt.id ?? i).padStart(4, "0")}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: C.primary, fontWeight: 700, fontFamily: "monospace" }}>
                        PAT-{String(apt.patient_id ?? "?").padStart(3, "0")}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: C.navy, fontWeight: 600 }}>
                        {apt.patient_name ?? apt.patient ?? "Unknown"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray }}>
                        {apt.appt_date ? new Date(apt.appt_date).toLocaleDateString() : "-"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray }}>
                        {apt.appt_date ? new Date(apt.appt_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : apt.time ?? "-"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: apt.status === "Completed" ? C.greenTint : apt.status === "Cancelled" ? C.redTint : C.amberTint,
                          color: apt.status === "Completed" ? C.green : apt.status === "Cancelled" ? "#dc2626" : "#d97706",
                        }}>{apt.status ?? "Pending"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* Records Tab */}
      {activeTab === "records" && (
        <Card>
          <CardHeader 
            title="Medical Records" 
            sub="Patient medical history" 
            action={
              <button
                onClick={() => setShowAddRecord(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 10, border: "none",
                  background: C.primary, color: C.white,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                <Plus size={16} /> Add Record
              </button>
            }
          />
          <div style={{ overflowX: "auto" }}>
            {medicalRecords.length === 0 ? (
              <p style={{ color: C.slate, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No medical records found.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.pageBg }}>
                    {["Record ID", "Patient", "Diagnosis", "Care Type", "Date"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.slate }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {medicalRecords.map((rec, i) => (
                    <tr key={rec.id ?? i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: C.slate, fontFamily: "monospace" }}>
                        {rec.rec_id_display || `REC-${String(rec.id ?? i).padStart(4, "0")}`}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: C.navy, fontWeight: 600 }}>
                        {rec.patient_name ?? "Unknown"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: C.charcoal }}>
                        {rec.diagnosis ?? "-"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: rec.care_type === "Inpatient" ? C.redTint : rec.care_type === "Emergency" ? C.amberTint : C.greenTint,
                          color: rec.care_type === "Inpatient" ? "#dc2626" : rec.care_type === "Emergency" ? "#d97706" : C.green,
                        }}>{rec.care_type ?? "Outpatient"}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: C.gray }}>
                        {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* Patient View Modal */}
      {viewingPatient && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div 
            onClick={() => setViewingPatient(null)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} 
          />
          <div style={{
            position: "relative", background: C.white, borderRadius: 16,
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)", width: "100%", maxWidth: 500,
            maxHeight: "90vh", overflow: "auto",
          }}>
            {/* Modal Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "20px 24px", borderBottom: `1px solid ${C.border}`,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>Patient Information</h2>
              <button
                onClick={() => setViewingPatient(null)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "none",
                  background: C.pageBg, cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <X size={18} color={C.gray} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: 24 }}>
              {/* Patient Header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 16, marginBottom: 24,
                paddingBottom: 20, borderBottom: `1px solid ${C.border}`,
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.primary}, ${C.teal})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.white, fontSize: 22, fontWeight: 700,
                }}>
                  {(viewingPatient.first_name?.[0] ?? viewingPatient.name?.[0] ?? "?").toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>
                    {viewingPatient.first_name && viewingPatient.last_name
                      ? `${viewingPatient.first_name} ${viewingPatient.last_name}`
                      : viewingPatient.name ?? "Unknown"}
                  </h3>
                  <p style={{ fontSize: 12, color: C.primary, fontWeight: 600, margin: "4px 0 0", fontFamily: "monospace" }}>
                    {viewingPatient.patient_id_display ?? `PAT-${String(viewingPatient.id ?? 0).padStart(3, "0")}`}
                  </p>
                </div>
              </div>

              {/* Personal Information */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: C.slate, marginBottom: 12 }}>PERSONAL INFORMATION</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: C.slate, fontWeight: 600, marginBottom: 4 }}>Date of Birth</div>
                    <div style={{ fontSize: 14, color: C.charcoal, display: "flex", alignItems: "center", gap: 6 }}>
                      <Calendar size={14} color={C.slate} />
                      {viewingPatient.dob ? new Date(viewingPatient.dob).toLocaleDateString() : "-"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.slate, fontWeight: 600, marginBottom: 4 }}>Age</div>
                    <div style={{ fontSize: 14, color: C.charcoal }}>
                      {viewingPatient.age ?? (viewingPatient.dob ? Math.floor((new Date() - new Date(viewingPatient.dob)) / 31536000000) : "-")} years
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.slate, fontWeight: 600, marginBottom: 4 }}>Gender</div>
                    <div style={{ fontSize: 14, color: C.charcoal }}>{viewingPatient.gender ?? "-"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.slate, fontWeight: 600, marginBottom: 4 }}>Blood Type</div>
                    <div style={{ fontSize: 14, color: C.charcoal, display: "flex", alignItems: "center", gap: 6 }}>
                      <Droplet size={14} color="#dc2626" />
                      {viewingPatient.blood_type ?? "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: C.slate, marginBottom: 12 }}>CONTACT INFORMATION</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Phone size={16} color={C.primary} />
                    <div>
                      <div style={{ fontSize: 11, color: C.slate }}>Phone</div>
                      <div style={{ fontSize: 14, color: C.charcoal }}>{viewingPatient.contact_no ?? viewingPatient.phone ?? "-"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Mail size={16} color={C.primary} />
                    <div>
                      <div style={{ fontSize: 11, color: C.slate }}>Email</div>
                      <div style={{ fontSize: 14, color: C.charcoal }}>{viewingPatient.email ?? "-"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <MapPin size={16} color={C.primary} />
                    <div>
                      <div style={{ fontSize: 11, color: C.slate }}>Address</div>
                      <div style={{ fontSize: 14, color: C.charcoal }}>{viewingPatient.address ?? "-"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: C.slate, marginBottom: 12 }}>EMERGENCY CONTACT</h4>
                <div style={{ background: C.amberTint, borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <AlertCircle size={20} color="#d97706" />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.charcoal }}>
                      {viewingPatient.emergency_contact_name ?? "-"}
                    </div>
                    <div style={{ fontSize: 13, color: C.gray }}>
                      {viewingPatient.emergency_contact_number ?? "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, textAlign: "right" }}>
              <button
                onClick={() => setViewingPatient(null)}
                style={{
                  padding: "10px 20px", borderRadius: 10, border: "none",
                  background: C.primary, color: C.white, fontSize: 13,
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Medical Record Modal */}
      {showAddRecord && (
        <AddMedicalRecordModal
          onClose={() => setShowAddRecord(false)}
          onSave={handleRecordSaved}
        />
      )}
    </div>
  );
}