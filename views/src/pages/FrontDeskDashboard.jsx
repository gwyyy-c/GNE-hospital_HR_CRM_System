/**
 * FrontDeskDashboard Page
 * =======================
 * 
 * Main dashboard for front desk staff. Handles patient registration,
 * appointment viewing, admissions tracking, and doctor availability checks.
 * 
 * Available Tabs:
 *   - dashboard: Overview with KPIs, appointments, and room status
 *   - patients: Full patient list with appointment history
 *   - appointments: Appointments table with doctor availability
 *   - admissions: Current patient admissions
 *   - billing: Billing information (placeholder)
 *   - inquiries: Hospital contact information and doctor availability
 * 
 * Features:
 *   - Patient registration with optional appointment booking
 *   - Two visit types: Walk-in and Appointment
 * 
 * @package   hr-pms-frontend
 * @category  Page Component (View in MVC)
 */
import { useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { UserPlus, Stethoscope, Users, Calendar, Activity, BedDouble, Edit3, Eye, DollarSign, Receipt, Clock, CheckCircle2 } from "lucide-react";
import { usePMSStore }              from "../hooks/usePMSStore";
import { useBillingStore, calcInvoiceTotals } from "../hooks/useBillingStore";
import { useAuth }                  from "../context/AuthContext";
import { useSearch }                from "../context/SearchContext";
import DoctorAvailabilityChecker    from "../components/PMS/DoctorAvailabilityChecker";
import PatientRegistrationForm      from "../components/PMS/PatientRegistrationForm";
import PatientEditForm              from "../components/PMS/PatientEditForm";
import BedManagement                from "../components/PMS/BedManagement";
import Toast                        from "../components/ui/Toast";
import DashboardBanner              from "../components/ui/DashboardBanner";

// FrontDesk  Theme
const C = {
  primary:      "#1E3A5F",  // FrontDesk navy blue
  primaryTint:  "#EEF3FF",
  teal:      "#0E93B1", blue:      "#5390FB", navy:      "#102544",
  slate:     "#7794A7", green:     "#45A72D", pageBg:    "#F5F5F5",
  white:     "#FFFFFF", charcoal:  "#2E2E2E", gray:      "#636363",
  border:    "#E8E8E8", tealTint:  "#E6F5F9", greenTint: "#EBF5E7",
  blueTint:  "#EEF3FF", amberTint: "#FFFBEB", redTint:   "#FFF1F2",
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden", ...style }}>
    {children}
  </div>
);

const CardHeader = ({ title, sub, action }) => (
  <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.border}`,
    display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <div style={{ fontSize: 16, fontWeight: 600, color: C.navy }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

const EmptyRow = ({ msg }) => (
  <p style={{ color: C.slate, fontSize: 13, textAlign: "center", padding: "24px 0" }}>{msg}</p>
);

// Bed Assignment Modal
function BedAssignmentModal({ patient, beds, doctors, onClose, onAssign }) {
  const [selectedBed, setSelectedBed] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [saving, setSaving] = useState(false);

  const availableBeds = beds.filter(b => b.status === "empty" || b.status === "available" || b.is_available);

  const handleSubmit = async () => {
    if (!selectedBed || !selectedDoctor) return;
    setSaving(true);
    try {
      await onAssign({
        patientId: patient.id,
        bedId: parseInt(selectedBed, 10),
        doctorId: parseInt(selectedDoctor, 10),
      });
      onClose();
    } catch (err) {
      console.error("Assignment error:", err);
    } finally {
      setSaving(false);
    }
  };

  const patientName = patient.first_name && patient.last_name
    ? `${patient.first_name} ${patient.last_name}`
    : patient.name ?? "Unknown";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div 
        style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)" }} 
        onClick={onClose} 
      />
      <div style={{ 
        position: "relative", background: C.white, borderRadius: 16, 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", width: "100%", maxWidth: 450, padding: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>
            <BedDouble size={20} style={{ display: "inline", marginRight: 10, verticalAlign: "middle", color: C.teal }} />
            Assign Bed to Patient
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.slate }}
          >×</button>
        </div>

        <div style={{ padding: "12px 16px", background: C.tealTint, borderRadius: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 4 }}>Assigning bed for:</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.navy }}>{patientName}</div>
          <div style={{ fontSize: 12, color: C.slate }}>{patient.patient_id_display ?? `PAT-${String(patient.id).padStart(3, "0")}`}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>
            Select Bed
          </label>
          <select
            value={selectedBed}
            onChange={(e) => setSelectedBed(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
              fontSize: 14, color: C.charcoal, background: C.white, cursor: "pointer", outline: "none",
            }}
          >
            <option value="">-- Select an available bed --</option>
            {availableBeds.map(bed => (
              <option key={bed.id} value={bed.id}>
                Bed {bed.bed_number ?? bed.id} - {bed.ward_type ?? bed.type ?? "General"} ({bed.room_number ? `Room ${bed.room_number}` : ""})
              </option>
            ))}
          </select>
          {availableBeds.length === 0 && (
            <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>No available beds at this time.</p>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>
            Attending Doctor
          </label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
              fontSize: 14, color: C.charcoal, background: C.white, cursor: "pointer", outline: "none",
            }}
          >
            <option value="">-- Select a doctor --</option>
            {doctors.map(doc => (
              <option key={doc.id} value={doc.id}>
                {doc.name} - {doc.specialization ?? "General"}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 10, background: C.pageBg, color: C.charcoal,
              fontSize: 14, fontWeight: 600, border: `1px solid ${C.border}`, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedBed || !selectedDoctor || saving}
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 10, 
              background: (!selectedBed || !selectedDoctor || saving) ? C.slate : C.green, 
              color: C.white,
              fontSize: 14, fontWeight: 600, border: "none", cursor: saving ? "wait" : "pointer",
              opacity: (!selectedBed || !selectedDoctor) ? 0.6 : 1,
            }}
          >
            {saving ? "Assigning..." : "Assign Bed"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AppointmentsTable({ appointments, onUpdateStatus }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed": return { bg: C.greenTint, color: C.green };
      case "Cancelled": return { bg: C.redTint, color: "#dc2626" };
      case "No-show":   return { bg: C.pageBg, color: C.gray };
      default:          return { bg: C.amberTint, color: "#d97706" };
    }
  };

  return (
    <Card>
      <CardHeader title="Appointments" sub="Confirmed and pending" />
      <div style={{ overflowX: "auto" }}>
        {appointments.length === 0 ? <EmptyRow msg="No appointments." /> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.pageBg }}>
                {["Appt. ID", "Patient ID", "Patient", "Doctor", "Date/Time", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.slate }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt, i) => {
                const currentStatus = apt.status ?? "Pending";
                const statusStyle = getStatusStyle(currentStatus);
                
                return (
                  <tr key={apt.id ?? i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: C.slate, fontFamily: "monospace" }}>
                      {apt.appt_id_display ?? `APT-${String(apt.id ?? i).padStart(4, "0")}`}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: C.primary, fontWeight: 700, fontFamily: "monospace" }}>
                      {apt.patient_id_display ?? `PAT-${String(apt.patient_id ?? "?").padStart(3, "0")}`}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.navy, fontWeight: 600 }}>
                      {apt.patient_name ?? apt.patient ?? ""}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.charcoal }}>
                      {apt.doctor_name ?? apt.doctor ?? ""}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray }}>
                      {apt.appt_date 
                        ? new Date(apt.appt_date).toLocaleString() 
                        : (apt.time ?? apt.appointment_time ?? "")}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <select
                        value={currentStatus}
                        onChange={(e) => onUpdateStatus?.(apt.id, e.target.value)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          border: `1px solid ${C.border}`,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          outline: "none",
                          minWidth: 110,
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No-show">No-show</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

function AdmissionsTable({ admissions, onDischarge }) {
  return (
    <Card>
      <CardHeader title="Current Admissions" sub="Active patient admissions" />
      <div style={{ overflowX: "auto" }}>
        {admissions.length === 0 ? <EmptyRow msg="No active admissions." /> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.pageBg }}>
                {["Adm. ID", "Patient ID", "Patient Name", "Bed / Ward", "Admitted", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.slate }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admissions.map((adm, i) => (
                <tr key={adm.id ?? i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.slate, fontFamily: "monospace" }}>
                    {adm.adm_id_display ?? `ADM-${String(adm.id ?? i).padStart(4, "0")}`}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.primary, fontWeight: 700, fontFamily: "monospace" }}>
                    {adm.patient_id_display ?? `PAT-${String(adm.patient_id ?? "?").padStart(3, "0")}`}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: C.navy, fontWeight: 600 }}>
                    {adm.patient_name ?? adm.patient ?? ""}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: C.charcoal }}>
                    {adm.bed_number ? `Bed ${adm.bed_number}` : ""}{adm.ward_type ? ` · ${adm.ward_type}` : ""}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray }}>
                    {adm.admit_date ? new Date(adm.admit_date).toLocaleDateString() : (adm.admission_date ?? "")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      display: "inline-flex", padding: "3px 10px", borderRadius: 20,
                      fontSize: 11, fontWeight: 700,
                      background: adm.status === "Discharged" ? C.amberTint : (adm.status === "Active" ? C.greenTint : C.tealTint),
                      color: adm.status === "Discharged" ? "#d97706" : (adm.status === "Active" ? C.green : C.teal),
                    }}>{adm.status ?? "Active"}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {adm.status !== "Discharged" && onDischarge && (
                      <button
                        onClick={() => onDischarge(adm)}
                        style={{
                          padding: "6px 12px", borderRadius: 8, border: "none",
                          background: C.redTint, color: "#dc2626", fontSize: 11,
                          fontWeight: 600, cursor: "pointer", transition: "background 150ms",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = C.redTint; }}
                      >
                        Discharge
                      </button>
                    )}
                    {adm.status === "Discharged" && (
                      <span style={{ fontSize: 11, color: C.gray }}>Discharged</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

function RoomStatus({ beds }) {
  const rooms = Array.from(
    beds.reduce((map, bed) => {
      const rk = bed.room ?? bed.room_number ?? "Unknown";
      if (!map.has(rk)) map.set(rk, { room: rk, type: bed.type ?? bed.room_type ?? "General", beds_total: 0, beds_occupied: 0 });
      const e = map.get(rk);
      e.beds_total += 1;
      if (bed.status === "occupied" || bed.is_occupied) e.beds_occupied += 1;
      return map;
    }, new Map()).values()
  );
  return (
    <Card>
      <CardHeader title="Room Status" sub="Available and occupied" />
      <div style={{ padding: "16px" }}>
        {rooms.length === 0 ? <EmptyRow msg="No room data available." /> : (
          rooms.map((room, i) => (
            <div key={`${room.room}-${i}`} style={{
              padding: "12px 14px", borderRadius: 10, background: C.pageBg,
              marginBottom: i < rooms.length - 1 ? 10 : 0,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Room {room.room}</div>
                  <div style={{ fontSize: 11, color: C.slate }}>{room.type}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>
                  {room.beds_occupied}/{room.beds_total} beds
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function KPIRow({ patients, appointments, admissions, beds }) {
  // KPI data with icons 
  const kpis = [
    { label: "Total Patients",     value: patients.length,     delta: "Registered", accent: C.blue,   Icon: Users    },
    { label: "Appointments Today", value: appointments.length, delta: "Scheduled",  accent: C.teal,   Icon: Calendar },
    { label: "Current Admissions", value: admissions.length,   delta: "Active",     accent: C.green,  Icon: Activity },
    { label: "Available Beds",     value: beds.filter(b => b.status === "available" || b.is_available).length, delta: "Open", accent: "#8b5cf6", Icon: BedDouble },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
      {kpis.map(({ label, value, delta, accent, Icon }) => (
        <div key={label} style={{
          background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "20px",
        }}>
          <span style={{
            width: 40, height: 40, borderRadius: 10, background: accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14, color: C.white,
          }}>
            <Icon size={20} />
          </span>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.navy, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 13, color: C.gray, marginTop: 5 }}>{label}</div>
          <div style={{ fontSize: 11, color: accent, fontWeight: 600, marginTop: 6 }}>{delta}</div>
        </div>
      ))}
    </div>
  );
}

function PatientsTable({ patients, appointments, onEditPatient, onViewPatient, onAssignBed }) {
  // Build a map of patient_id -> latest appointment
  const patientAppointments = appointments.reduce((acc, apt) => {
    const pid = apt.patient_id;
    if (!acc[pid] || new Date(apt.appt_date ?? apt.appointment_date) > new Date(acc[pid].appt_date ?? acc[pid].appointment_date)) {
      acc[pid] = apt;
    }
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader title="Patient List" sub="All registered patients" />
      <div style={{ overflowX: "auto" }}>
        {patients.length === 0 ? <EmptyRow msg="No patients registered." /> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.pageBg }}>
                {["Patient ID", "Name", "Date of Birth", "Gender", "Contact", "Last Appointment", "Doctor", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.slate }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map((pat, i) => {
                const latestApt = patientAppointments[pat.id];
                const patientName = pat.first_name && pat.last_name 
                  ? `${pat.first_name} ${pat.last_name}` 
                  : pat.name ?? "";
                const isAdmitted = pat.status === "Admitted";
                return (
                  <tr key={pat.id ?? i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: C.primary, fontWeight: 700, fontFamily: "monospace" }}>
                      {pat.patient_id_display ?? `PAT-${String(pat.id ?? i).padStart(3, "0")}`}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.navy, fontWeight: 600 }}>
                      {patientName}
                      {isAdmitted && (
                        <span style={{
                          marginLeft: 8, padding: "2px 6px", borderRadius: 10, fontSize: 9,
                          background: C.greenTint, color: C.green, fontWeight: 700,
                        }}>Admitted</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray }}>
                      {pat.dob ? new Date(pat.dob).toLocaleDateString() : ""}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.charcoal }}>
                      {pat.gender ?? ""}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.charcoal }}>
                      {pat.contact_no ?? pat.phone ?? ""}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray }}>
                      {latestApt 
                        ? new Date(latestApt.appt_date ?? latestApt.appointment_date).toLocaleDateString() 
                        : <span style={{ color: C.slate, fontStyle: "italic" }}>No appointment</span>}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.charcoal }}>
                      {latestApt?.doctor_name ?? latestApt?.doctor ?? ""}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button
                          onClick={() => onViewPatient?.(pat)}
                          style={{
                            display: "flex", alignItems: "center", gap: 4, padding: "6px 10px",
                            borderRadius: 8, background: C.tealTint, color: C.teal,
                            fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer",
                          }}
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          onClick={() => onEditPatient?.(pat)}
                          style={{
                            display: "flex", alignItems: "center", gap: 4, padding: "6px 10px",
                            borderRadius: 8, background: C.blueTint, color: C.blue,
                            fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer",
                          }}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        {!isAdmitted && (
                          <button
                            onClick={() => onAssignBed?.(pat)}
                            style={{
                              display: "flex", alignItems: "center", gap: 4, padding: "6px 10px",
                              borderRadius: 8, background: C.greenTint, color: C.green,
                              fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer",
                            }}
                          >
                            <BedDouble size={14} /> Assign Bed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

//  Main exported component 
export default function FrontDeskDashboard() {
  const { user }     = useAuth();
  const { pathname } = useLocation();

  const activeTab = pathname.includes("patients")      ? "patients"
                  : pathname.includes("appointments") ? "appointments"
                  : pathname.includes("admissions")   ? "admissions"
                  : pathname.includes("billing")      ? "billing"
                  : pathname.includes("inquiries")    ? "inquiries"
                  : "dashboard";

  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [editingPatient, setEditingPatient]     = useState(null);
  const [viewingPatient, setViewingPatient]     = useState(null);
  const [bedAssignmentPatient, setBedAssignmentPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor]     = useState(null);
  const [selectedBed, setSelectedBed]           = useState(null);
  const [toast, setToast]                       = useState(null);

  const showToast = useCallback((type, message) => setToast({ type, message }), []);

  const { query: searchQuery } = useSearch();

  const store        = usePMSStore() ?? {};
  const billingStore = useBillingStore();

  // Handle patient discharge - creates an invoice and moves to billing
  const handleDischargePatient = useCallback((admission) => {
    try {
      // Create an invoice for the discharged patient
      const invoiceId = billingStore.createInvoice({
        patientId: admission.patient_id,
        patientName: admission.patient_name ?? admission.patient ?? "Unknown Patient",
        doctorId: admission.doctor_id ?? null,
        doctorName: admission.doctor_name ?? "N/A",
        bedId: admission.bed_number ?? admission.bed_id ?? null,
        wardCode: admission.ward_type?.toLowerCase() ?? "general",
        admittedAt: admission.admit_date ?? admission.admission_date ?? new Date().toISOString(),
        admissionId: admission.id,
      });
      
      // Update admission status locally (optimistic update)
      // In production, this would also call an API to update the admission status
      showToast("success", `Patient ${admission.patient_name ?? admission.patient} discharged. Invoice ${invoiceId} created.`);
    } catch (err) {
      console.error("Failed to discharge patient:", err);
      showToast("error", "Failed to process discharge. Please try again.");
    }
  }, [billingStore, showToast]);

  const patientsRaw     = Array.isArray(store.patients)     ? store.patients     : [];
  const appointmentsRaw = Array.isArray(store.appointments) ? store.appointments : [];
  const admissionsRaw   = Array.isArray(store.admissions)   ? store.admissions   : [];
  const beds         = Array.isArray(store.beds)         ? store.beds         : [];
  const doctors      = Array.isArray(store.doctors)      ? store.doctors      : [];
  const loading      = store.loading ?? false;
  const error        = store.error   ?? null;

  // Billing data
  const invoicesRaw     = billingStore?.invoices ?? [];
  const billingStats = billingStore?.stats ?? {};

  // Search filtering logic
  const searchLower = searchQuery?.toLowerCase() ?? "";
  
  const patients = useMemo(() => {
    if (!searchLower) return patientsRaw;
    return patientsRaw.filter(pat => {
      const name = `${pat.first_name ?? ""} ${pat.last_name ?? ""} ${pat.name ?? ""}`.toLowerCase();
      const id = (pat.patient_id_display ?? `PAT-${String(pat.id).padStart(3, "0")}`).toLowerCase();
      const contact = (pat.contact_no ?? pat.phone ?? "").toLowerCase();
      const email = (pat.email ?? "").toLowerCase();
      return name.includes(searchLower) || id.includes(searchLower) || contact.includes(searchLower) || email.includes(searchLower);
    });
  }, [patientsRaw, searchLower]);

  const appointments = useMemo(() => {
    if (!searchLower) return appointmentsRaw;
    return appointmentsRaw.filter(apt => {
      const patient = (apt.patient_name ?? apt.patient ?? "").toLowerCase();
      const doctor = (apt.doctor_name ?? apt.doctor ?? "").toLowerCase();
      const id = (apt.appt_id_display ?? `APT-${String(apt.id).padStart(4, "0")}`).toLowerCase();
      const status = (apt.status ?? "").toLowerCase();
      return patient.includes(searchLower) || doctor.includes(searchLower) || id.includes(searchLower) || status.includes(searchLower);
    });
  }, [appointmentsRaw, searchLower]);

  const admissions = useMemo(() => {
    if (!searchLower) return admissionsRaw;
    return admissionsRaw.filter(adm => {
      const patient = (adm.patient_name ?? adm.patient ?? "").toLowerCase();
      const id = (adm.adm_id_display ?? `ADM-${String(adm.id).padStart(4, "0")}`).toLowerCase();
      const ward = (adm.ward_type ?? "").toLowerCase();
      return patient.includes(searchLower) || id.includes(searchLower) || ward.includes(searchLower);
    });
  }, [admissionsRaw, searchLower]);

  const invoices = useMemo(() => {
    if (!searchLower) return invoicesRaw;
    return invoicesRaw.filter(inv => {
      const patient = (inv.patientName ?? "").toLowerCase();
      const doctor = (inv.doctorName ?? "").toLowerCase();
      const id = (inv.id ?? "").toString().toLowerCase();
      const status = (inv.status ?? "").toLowerCase();
      return patient.includes(searchLower) || doctor.includes(searchLower) || id.includes(searchLower) || status.includes(searchLower);
    });
  }, [invoicesRaw, searchLower]);

  if (loading) return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: 60, textAlign: "center", color: C.slate }}>Loading dashboard</div>
  );

  if (error) return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: 60, textAlign: "center", color: "#dc2626" }}>
      Failed to load data: {error?.message ?? String(error)}
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Welcome Banner */}
      <div style={{ marginBottom: 24 }}>
        <DashboardBanner />
      </div>

      {/*  Dashboard  */}
      {activeTab === "dashboard" && (
        <>
          <KPIRow patients={patients} appointments={appointments} admissions={admissions} beds={beds} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            <AppointmentsTable 
              appointments={appointments} 
              onUpdateStatus={async (apptId, status) => {
                if (!apptId) {
                  showToast("error", "Cannot update: appointment ID is missing");
                  return;
                }
                try {
                  await store.updateAppointmentStatus(apptId, status);
                  showToast("success", `Appointment status updated to ${status}`);
                } catch (err) {
                  console.error("Appointment update error:", err);
                  showToast("error", `Failed to update appointment status: ${err.message || "Unknown error"}`);
                }
              }}
            />
            <RoomStatus beds={beds} />
          </div>
          <AdmissionsTable admissions={admissions} onDischarge={handleDischargePatient} />
        </>
      )}

      {/*  Patients  */}
      {activeTab === "patients" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button
              onClick={() => setShowRegisterForm(true)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
                borderRadius: 12, background: C.primary, color: C.white, fontSize: 13,
                fontWeight: 600, border: "none", cursor: "pointer",
                boxShadow: "0 2px 8px rgba(30,58,95,0.30)",
              }}
            >
              <UserPlus size={16} /> Register Patient
            </button>
          </div>
          <PatientsTable 
            patients={patients} 
            appointments={appointments} 
            onEditPatient={(pat) => setEditingPatient(pat)}
            onViewPatient={(pat) => setViewingPatient(pat)}
            onAssignBed={(pat) => setBedAssignmentPatient(pat)}
          />
        </>
      )}

      {/*  Appointments  */}
      {activeTab === "appointments" && (
        <>
          <div style={{ marginBottom: 24 }}>
            <AppointmentsTable 
              appointments={appointments}
              onUpdateStatus={async (apptId, status) => {
                if (!apptId) {
                  showToast("error", "Cannot update: appointment ID is missing");
                  return;
                }
                try {
                  await store.updateAppointmentStatus(apptId, status);
                  showToast("success", `Appointment status updated to ${status}`);
                } catch (err) {
                  console.error("Appointment update error:", err);
                  showToast("error", `Failed to update appointment status: ${err.message || "Unknown error"}`);
                }
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.navy, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Stethoscope size={17} color={C.teal} /> Doctor Availability
            </div>
            <DoctorAvailabilityChecker
              doctors={doctors}
              selectedDoctor={selectedDoctor}
              onSelectDoctor={setSelectedDoctor}
              showAllToggle={true}
            />
          </div>
        </>
      )}

      {/*  Admissions  */}
      {activeTab === "admissions" && (
        <>
          <AdmissionsTable admissions={admissions} onDischarge={handleDischargePatient} />
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.navy, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <BedDouble size={17} color={C.teal} /> Bed Management
            </div>
            <BedManagement
              beds={beds}
              selectedBed={selectedBed}
              onSelectBed={setSelectedBed}
              canEdit={true}
              onUpdateBedStatus={async (bedId, status) => {
                try {
                  await store.updateBedStatus?.(bedId, status);
                  showToast("success", `Bed ${bedId} status updated to ${status}`);
                } catch (err) {
                  showToast("error", "Failed to update bed status");
                }
              }}
            />
          </div>
        </>
      )}

      {/*  Billing  */}
      {activeTab === "billing" && (
        <>
          {/* Invoices Table */}
          <Card>
            <CardHeader title="Patient Invoices" sub="View and manage billing status for discharged patients" />
            <div style={{ overflowX: "auto" }}>
              {invoices.length === 0 ? <EmptyRow msg="No invoices found. Discharge a patient to create an invoice." /> : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: C.pageBg }}>
                      {["Invoice ID", "Patient", "Doctor", "Bed", "Status", "Amount", "Date", "Actions"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.slate }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, i) => {
                      const totals = calcInvoiceTotals(inv);
                      const statusColors = {
                        pending: { bg: C.amberTint, color: "#d97706" },
                        paid: { bg: C.greenTint, color: C.green },
                        partial: { bg: C.blueTint, color: C.blue },
                        waived: { bg: C.pageBg, color: C.gray },
                      };
                      const statusStyle = statusColors[inv.status] ?? statusColors.pending;
                      return (
                        <tr key={inv.id ?? i} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: C.slate, fontFamily: "monospace" }}>
                            {inv.id}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: C.navy, fontWeight: 600 }}>
                            {inv.patientName}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: C.charcoal }}>
                            {inv.doctorName}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: C.charcoal }}>
                            {inv.bedId ?? "-"}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", padding: "3px 10px",
                              borderRadius: 20, fontSize: 11, fontWeight: 700,
                              background: statusStyle.bg, color: statusStyle.color,
                              textTransform: "capitalize",
                            }}>{inv.status}</span>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: C.navy }}>
                            ₱{totals.grand.toLocaleString()}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: C.gray }}>
                            {inv.admittedAt ? new Date(inv.admittedAt).toLocaleDateString() : "-"}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            {inv.status !== "waived" && (
                              <button
                                onClick={() => {
                                  billingStore.toggleInvoiceStatus(inv.id);
                                  showToast("success", `Invoice ${inv.id} marked as ${inv.status === "pending" ? "Paid" : "Pending"}`);
                                }}
                                style={{
                                  padding: "6px 12px", borderRadius: 8, border: "none",
                                  background: inv.status === "pending" ? C.greenTint : C.amberTint,
                                  color: inv.status === "pending" ? C.green : "#d97706",
                                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                                  transition: "background 150ms",
                                }}
                              >
                                {inv.status === "pending" ? "Mark Paid" : "Mark Pending"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </Card>

          <div style={{ marginTop: 16, padding: "16px 20px", background: C.greenTint, borderRadius: 12, border: `1px solid ${C.green}40` }}>
            <p style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>
              <CheckCircle2 size={16} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} />
              Billing is now integrated with admissions. Discharge patients from the Admissions tab to create invoices.
            </p>
          </div>
        </>
      )}

      {/*  Inquiries  */}
      {activeTab === "inquiries" && (
        <>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.navy, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Stethoscope size={17} color={C.teal} /> Doctor Availability
            </div>
            <DoctorAvailabilityChecker
              doctors={doctors}
              selectedDoctor={selectedDoctor}
              onSelectDoctor={setSelectedDoctor}
              showAllToggle={true}
            />
          </div>
          <Card>
            <CardHeader title="General Inquiries" sub="Hospital information and contact" />
            <div style={{ padding: 24 }}>
              {[
                { label: "Emergency Hotline",  value: "(02) 8005-5501" },
                { label: "Front Desk Direct",  value: "(02) 8005-5502" },
                { label: "Email",              value: "frontdesk@gne-hospital.com" },
                { label: "Operating Hours",    value: "24 / 7" },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0", borderBottom: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: 13, color: C.slate }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/*  Register Patient modal  */}
      {showRegisterForm && (
        <PatientRegistrationForm
          onClose={() => setShowRegisterForm(false)}
          doctors={doctors}
          onRegister={async (formData) => {
            try {
              // First, register the patient
              const newPatient = await store.registerPatient?.({ ...formData, age: Number(formData.age) });
              
              // If visit type is "Appointment", also book an appointment
              if (formData.visitType === "Appointment" && formData.appointmentDoctor && formData.appointmentDate) {
                const patientId = newPatient?.id ?? newPatient?.patient_id;
                if (patientId) {
                  const apptDateTime = `${formData.appointmentDate} ${formData.appointmentTime || "09:00"}:00`;
                  await store.bookAppointment?.({
                    patient_id: patientId,
                    doctor_id: parseInt(formData.appointmentDoctor, 10),
                    appt_date: apptDateTime,
                    visit_reason: formData.reason || "Scheduled appointment",
                  });
                  showToast("success", "Patient registered and appointment booked successfully!");
                } else {
                  showToast("success", "Patient registered. Appointment booking requires patient ID.");
                }
              } else {
                showToast("success", "Patient registered successfully!");
              }
              
              setShowRegisterForm(false);
            } catch (err) {
              console.error("Registration/booking error:", err);
              showToast("error", "Failed to register patient. Please try again.");
            }
          }}
        />
      )}

      {/*  Edit Patient modal  */}
      {editingPatient && (
        <PatientEditForm
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSave={async (patientId, data) => {
            try {
              await store.updatePatient?.(patientId, data);
              showToast("success", "Patient information updated successfully!");
            } catch (err) {
              console.error("Update error:", err);
              showToast("error", "Failed to update patient. Please try again.");
              throw err;
            }
          }}
        />
      )}

      {/*  View Patient modal  */}
      {viewingPatient && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div 
            style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)" }} 
            onClick={() => setViewingPatient(null)} 
          />
          <div style={{ 
            position: "relative", background: C.white, borderRadius: 16, 
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", width: "100%", maxWidth: 500, padding: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>Patient Details</h3>
              <button
                onClick={() => setViewingPatient(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.slate }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Patient ID", value: viewingPatient.patient_id_display ?? `PAT-${String(viewingPatient.id).padStart(3, "0")}` },
                { label: "Full Name", value: `${viewingPatient.first_name ?? ""} ${viewingPatient.last_name ?? ""}`.trim() || viewingPatient.name },
                { label: "Date of Birth", value: viewingPatient.dob ? new Date(viewingPatient.dob).toLocaleDateString() : "N/A" },
                { label: "Gender", value: viewingPatient.gender ?? "N/A" },
                { label: "Contact", value: viewingPatient.contact_no ?? viewingPatient.phone ?? "N/A" },
                { label: "Email", value: viewingPatient.email ?? "N/A" },
                { label: "Blood Type", value: viewingPatient.blood_type ?? "Unknown" },
                { label: "Address", value: viewingPatient.address ?? "N/A" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.slate, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, color: C.navy, fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>

            {(viewingPatient.emergency_contact_name || viewingPatient.emergency_contact_number) && (
              <div style={{ marginTop: 20, padding: 16, background: C.amberTint, borderRadius: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#d97706", marginBottom: 8 }}>Emergency Contact</div>
                <div style={{ fontSize: 14, color: C.navy }}>
                  {viewingPatient.emergency_contact_name ?? "N/A"} · {viewingPatient.emergency_contact_number ?? "N/A"}
                </div>
              </div>
            )}

            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <button
                onClick={() => {
                  setViewingPatient(null);
                  setEditingPatient(viewingPatient);
                }}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 10, background: C.primary, color: C.white,
                  fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <Edit3 size={16} /> Edit Patient
              </button>
              <button
                onClick={() => setViewingPatient(null)}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 10, background: C.pageBg, color: C.charcoal,
                  fontSize: 14, fontWeight: 600, border: `1px solid ${C.border}`, cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  Bed Assignment modal  */}
      {bedAssignmentPatient && (
        <BedAssignmentModal
          patient={bedAssignmentPatient}
          beds={beds}
          doctors={doctors}
          onClose={() => setBedAssignmentPatient(null)}
          onAssign={async ({ patientId, bedId, doctorId }) => {
            try {
              await store.assignPatient?.({ patientId, bedId, doctorId });
              showToast("success", "Patient admitted and bed assigned successfully!");
              setBedAssignmentPatient(null);
            } catch (err) {
              showToast("error", "Failed to assign bed. Please try again.");
              throw err;
            }
          }}
        />
      )}

      {/* Toast notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
