// src/data/pmsData.js
// Shared PMS constants (status styles, ward definitions, form options).
// Used by PMS components for display styling and form dropdowns.

export const DOCTOR_STATUS_STYLES = {
  "Available":  { bg: "bg-success-100",  text: "text-success-700",  dot: "bg-success-500"  },
  "Busy":       { bg: "bg-warning-100",  text: "text-warning-700",  dot: "bg-warning-500"  },
  "In Surgery": { bg: "bg-danger-100",   text: "text-danger-700",   dot: "bg-danger-500"   },
  "Off Shift":  { bg: "bg-surface-100",  text: "text-surface-500",  dot: "bg-surface-400"  },
};

export const BED_STATUS_STYLES = {
  "empty":       { bg: "bg-success-100",  text: "text-success-700",  dot: "bg-success-500", border: "border-success-300" },
  "occupied":    { bg: "bg-danger-100",   text: "text-danger-700",   dot: "bg-danger-500", border: "border-danger-300"   },
  "reserved":    { bg: "bg-warning-100",  text: "text-warning-700",  dot: "bg-warning-500", border: "border-warning-300"  },
  "maintenance": { bg: "bg-surface-100",  text: "text-surface-500",  dot: "bg-surface-400", border: "border-surface-300"  },
};

// Hospital ward definitions
export const WARDS = [
  { id: "GW",  name: "General Ward",      color: "#22c55e" },
  { id: "ICU", name: "ICU",               color: "#ef4444" },
  { id: "PED", name: "Pediatrics",        color: "#8b5cf6" },
  { id: "MAT", name: "Maternity",         color: "#ec4899" },
  { id: "SRG", name: "Surgical",          color: "#f97316" },
  { id: "CRD", name: "Cardiology",        color: "#0ea5e9" },
];

export const VISIT_TYPES  = ["Walk-in", "Appointment"];
export const GENDERS      = ["Male", "Female", "Other", "Prefer not to say"];
export const BLOOD_TYPES  = ["Unknown", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
