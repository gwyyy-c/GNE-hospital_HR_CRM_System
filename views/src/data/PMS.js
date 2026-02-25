// src/data/PMS.js
// ─────────────────────────────────────────────────────────────────────────────
// Mock data for the Patient Management / Front Desk module.
// Used for demo/seed data. Live data comes from the PHP API.
// ─────────────────────────────────────────────────────────────────────────────

// ── Wards & Bed layout ────────────────────────────────────────────────────────
export const WARDS = [
  { id: "w001", name: "General Ward",     shortCode: "GW", color: "#2563eb", beds: 12 },
  { id: "w002", name: "ICU",             shortCode: "ICU", color: "#dc2626", beds: 8  },
  { id: "w003", name: "Pediatrics",      shortCode: "PED", color: "#16a34a", beds: 10 },
  { id: "w004", name: "Maternity",       shortCode: "MAT", color: "#9333ea", beds: 8  },
  { id: "w005", name: "Surgical",        shortCode: "SRG", color: "#ea580c", beds: 10 },
  { id: "w006", name: "Cardiology",      shortCode: "CRD", color: "#0891b2", beds: 8  },
];

// Generate beds for each ward
function generateBeds(wards) {
  const beds = [];
  wards.forEach((ward) => {
    for (let i = 1; i <= ward.beds; i++) {
      const bedNum = String(i).padStart(2, "0");
      beds.push({
        id:       `${ward.shortCode}-${bedNum}`,
        wardId:   ward.id,
        wardName: ward.name,
        number:   `${ward.shortCode}-${bedNum}`,
        status:   "empty",       // "empty" | "occupied" | "reserved" | "maintenance"
        patientId:   null,
        patientName: null,
        assignedAt:  null,
        doctorId:    null,
        doctorName:  null,
      });
    }
  });
  return beds;
}

export const INITIAL_BEDS = (() => {
  const beds = generateBeds(WARDS);
  // Pre-occupy some beds for realism
  const preOccupied = [
    { id: "GW-01", patientName: "Carlos Rivera",    doctorName: "Dr. Emily Chen",    status: "occupied" },
    { id: "GW-02", patientName: "Mei Tanaka",       doctorName: "Dr. Emily Chen",    status: "occupied" },
    { id: "GW-04", patientName: "Samuel Adeyemi",   doctorName: "Dr. Marcus Webb",   status: "occupied" },
    { id: "GW-07", patientName: "Priya Nair",       doctorName: "Dr. Marcus Webb",   status: "occupied" },
    { id: "ICU-01",patientName: "Thomas Brennan",   doctorName: "Dr. James Osei",    status: "occupied" },
    { id: "ICU-02",patientName: "Liu Yang",         doctorName: "Dr. Fatima Hassan", status: "occupied" },
    { id: "ICU-04",patientName: "Grace Otieno",     doctorName: "Dr. James Osei",    status: "occupied" },
    { id: "PED-01",patientName: "Amelia Kowalski",  doctorName: "Dr. Aisha Patel",   status: "occupied" },
    { id: "PED-03",patientName: "Noah Mensah",      doctorName: "Dr. Aisha Patel",   status: "occupied" },
    { id: "SRG-02",patientName: "Hassan Al-Rashid", doctorName: "Dr. Robert Kim",    status: "occupied" },
    { id: "SRG-05",patientName: "Elena Petrov",     doctorName: "Dr. Robert Kim",    status: "occupied" },
    { id: "CRD-01",patientName: "Walter Chen",      doctorName: "Dr. Fatima Hassan", status: "occupied" },
    { id: "GW-09", patientName: null, doctorName: null, status: "maintenance" },
    { id: "ICU-07",patientName: null, doctorName: null, status: "maintenance" },
    { id: "GW-05", patientName: null, doctorName: null, status: "reserved" },
    { id: "PED-06",patientName: null, doctorName: null, status: "reserved" },
  ];
  return beds.map((bed) => {
    const override = preOccupied.find((p) => p.id === bed.id);
    if (!override) return bed;
    return {
      ...bed,
      status:      override.status,
      patientName: override.patientName ?? null,
      doctorName:  override.doctorName  ?? null,
      assignedAt:  override.status === "occupied" ? new Date(Date.now() - Math.random() * 86400000 * 3).toISOString() : null,
    };
  });
})();

// ── Doctors with shift / availability data ────────────────────────────────────
export const INITIAL_DOCTORS = [
  {
    id: "d001", name: "Dr. Emily Chen",    specialization: "Internal Medicine",
    status: "Available",  currentShift: true,  shiftStart: "08:00", shiftEnd: "17:00",
    patientCount: 2, avatar: "EC", department: "Internal Medicine",
  },
  {
    id: "d002", name: "Dr. Marcus Webb",   specialization: "Emergency Medicine",
    status: "Available",  currentShift: true,  shiftStart: "07:00", shiftEnd: "15:00",
    patientCount: 2, avatar: "MW", department: "Emergency Medicine",
  },
  {
    id: "d003", name: "Dr. Aisha Patel",   specialization: "Pediatrics",
    status: "Busy",       currentShift: true,  shiftStart: "09:00", shiftEnd: "18:00",
    patientCount: 5, avatar: "AP", department: "Pediatrics",
  },
  {
    id: "d004", name: "Dr. Lin Zhao",      specialization: "Radiology",
    status: "Off Shift",  currentShift: false, shiftStart: "15:00", shiftEnd: "23:00",
    patientCount: 0, avatar: "LZ", department: "Radiology",
  },
  {
    id: "d005", name: "Dr. Robert Kim",    specialization: "General Surgery",
    status: "In Surgery", currentShift: true,  shiftStart: "06:00", shiftEnd: "14:00",
    patientCount: 2, avatar: "RK", department: "Surgery",
  },
  {
    id: "d006", name: "Dr. Fatima Hassan", specialization: "Cardiology",
    status: "Available",  currentShift: true,  shiftStart: "08:00", shiftEnd: "17:00",
    patientCount: 2, avatar: "FH", department: "Cardiology",
  },
  {
    id: "d007", name: "Dr. James Osei",    specialization: "Neurology",
    status: "Available",  currentShift: true,  shiftStart: "09:00", shiftEnd: "18:00",
    patientCount: 2, avatar: "JO", department: "Neurology",
  },
  {
    id: "d008", name: "Dr. Nadia Ortiz",   specialization: "Pharmacology",
    status: "Off Shift",  currentShift: false, shiftStart: "17:00", shiftEnd: "01:00",
    patientCount: 0, avatar: "NO", department: "Pharmacy",
  },
];

// ── Registered patients ────────────────────────────────────────────────────────
export const INITIAL_PATIENTS = [
  {
    id: "p001", name: "Carlos Rivera",     age: 45, gender: "Male",
    phone: "+1 555-1001", email: "c.rivera@email.com",
    visitType: "Walk-in", reason: "Chest pain and shortness of breath",
    status: "Admitted", registeredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    doctorId: "d001", bedId: "GW-01", bloodType: "O+",
    emergencyContact: "Maria Rivera – +1 555-1002",
  },
  {
    id: "p002", name: "Mei Tanaka",        age: 32, gender: "Female",
    phone: "+1 555-1003", email: "m.tanaka@email.com",
    visitType: "Appointment", reason: "Post-operative follow-up",
    status: "Admitted", registeredAt: new Date(Date.now() - 86400000).toISOString(),
    doctorId: "d001", bedId: "GW-02", bloodType: "A+",
    emergencyContact: "Kenji Tanaka – +1 555-1004",
  },
  {
    id: "p003", name: "Samuel Adeyemi",    age: 58, gender: "Male",
    phone: "+1 555-1005", email: "s.adeyemi@email.com",
    visitType: "Walk-in", reason: "High fever and severe headache",
    status: "Admitted", registeredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    doctorId: "d002", bedId: "GW-04", bloodType: "B+",
    emergencyContact: "Ngozi Adeyemi – +1 555-1006",
  },
  {
    id: "p004", name: "Priya Nair",        age: 27, gender: "Female",
    phone: "+1 555-1007", email: "p.nair@email.com",
    visitType: "Appointment", reason: "Asthma management review",
    status: "Waiting", registeredAt: new Date().toISOString(),
    doctorId: null, bedId: null, bloodType: "AB-",
    emergencyContact: "Rajan Nair – +1 555-1008",
  },
  {
    id: "p005", name: "Thomas Brennan",    age: 71, gender: "Male",
    phone: "+1 555-1009", email: "t.brennan@email.com",
    visitType: "Walk-in", reason: "Stroke symptoms — urgent",
    status: "Admitted", registeredAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    doctorId: "d007", bedId: "ICU-01", bloodType: "O-",
    emergencyContact: "Siobhan Brennan – +1 555-1010",
  },
];

// ── Visit type options ─────────────────────────────────────────────────────────
export const VISIT_TYPES   = ["Walk-in", "Appointment"];
export const GENDERS       = ["Male", "Female", "Non-binary", "Prefer not to say"];
export const BLOOD_TYPES   = ["A+","A-","B+","B-","AB+","AB-","O+","O-","Unknown"];
export const PATIENT_STATUS= ["Waiting","Admitted","Discharged","Under Observation"];

// ── Doctor availability status colors ─────────────────────────────────────────
export const DOCTOR_STATUS_STYLES = {
  "Available":  { bg: "bg-success-100",  text: "text-success-700",  dot: "bg-success-500",  ring: "ring-success-200"  },
  "Busy":       { bg: "bg-warning-100",  text: "text-warning-700",  dot: "bg-warning-500",  ring: "ring-warning-200"  },
  "In Surgery": { bg: "bg-danger-100",   text: "text-danger-700",   dot: "bg-danger-500",   ring: "ring-danger-200"   },
  "Off Shift":  { bg: "bg-surface-100",  text: "text-surface-500",  dot: "bg-surface-400",  ring: "ring-surface-200"  },
};

// ── Bed status styles ──────────────────────────────────────────────────────────
export const BED_STATUS_STYLES = {
  empty:       { bg: "bg-success-50",   border: "border-success-200", text: "text-success-700",  label: "Available"    },
  occupied:    { bg: "bg-danger-50",    border: "border-danger-200",   text: "text-danger-700",   label: "Occupied"     },
  reserved:    { bg: "bg-warning-50",   border: "border-warning-200",  text: "text-warning-700",  label: "Reserved"     },
  maintenance: { bg: "bg-surface-100",  border: "border-surface-300",  text: "text-surface-500",  label: "Maintenance"  },
};