/**
 * Billing Data Constants
 * Ward rates, treatment charges, payment methods, and seed invoices.
 */

/** Ward room rates (per night, USD) */
export const WARD_RATES = {
  "GW":  { name: "General Ward",  ratePerDay: 180,  label: "Standard" },
  "ICU": { name: "ICU",           ratePerDay: 950,  label: "Critical Care" },
  "PED": { name: "Pediatrics",    ratePerDay: 220,  label: "Pediatric" },
  "MAT": { name: "Maternity",     ratePerDay: 310,  label: "Maternity" },
  "SRG": { name: "Surgical",      ratePerDay: 420,  label: "Surgical" },
  "CRD": { name: "Cardiology",    ratePerDay: 580,  label: "Cardiac Care" },
};

/** Treatment/procedure charge catalogue */
export const TREATMENT_CHARGES = {
  consultation:       { label: "Doctor Consultation",        rate: 120  },
  emergency_consult:  { label: "Emergency Consultation",     rate: 280  },
  blood_test:         { label: "Blood Tests (CBC/BMP)",      rate: 95   },
  ecg:                { label: "ECG / EKG",                  rate: 75   },
  xray:               { label: "Chest X-Ray",                rate: 140  },
  iv_therapy:         { label: "IV Therapy / Infusion",      rate: 85   },
  nursing_per_day:    { label: "Nursing Care (per day)",     rate: 140  },
  medication_admin:   { label: "Medication Administration",  rate: 45   },
  wound_dressing:     { label: "Wound Dressing / Care",      rate: 65   },
  procedure_minor:    { label: "Minor Procedure",            rate: 350  },
  procedure_major:    { label: "Major Procedure / Surgery",  rate: 2800 },
  anesthesia:         { label: "Anesthesia",                 rate: 680  },
  pathology:          { label: "Pathology / Lab Panel",      rate: 160  },
  physiotherapy:      { label: "Physiotherapy Session",      rate: 90   },
  pharmacy:           { label: "Pharmacy / Medications",     rate: 0    },
};

/** Available payment methods */
export const PAYMENT_METHODS = [
  { id: "cash",        label: "Cash",               icon: "💵" },
  { id: "card",        label: "Credit / Debit Card", icon: "💳" },
  { id: "insurance",   label: "Insurance",           icon: "🏛️" },
  { id: "bank",        label: "Bank Transfer",       icon: "🏦" },
  { id: "mobile",      label: "Mobile Payment",      icon: "📱" },
];

/** Insurance provider options */
export const INSURANCE_PROVIDERS = [
  "BlueCross BlueShield", "Aetna", "United Healthcare", "Cigna",
  "Humana", "Kaiser Permanente", "Anthem", "Molina Healthcare",
  "Medicare", "Medicaid", "Self-Pay",
];

/** Sample invoices for development/testing */
export const INITIAL_INVOICES = [
  {
    id: "inv-001",
    patientId: "p001",
    patientName: "Carlos Rivera",
    patientAge: 45,
    doctorId: "d001",
    doctorName: "Dr. Emily Chen",
    bedId: "GW-01",
    wardCode: "GW",
    admittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    dischargedAt: null,
    status: "pending",
    paymentMethod: null,
    paidAt: null,
    insuranceProvider: null,
    insuranceClaim: null,
    lineItems: [
      { id: "li001", category: "consultation",    label: "Doctor Consultation",     qty: 1, unitRate: 120, amount: 120 },
      { id: "li002", category: "blood_test",      label: "CBC + Basic Metabolic",   qty: 1, unitRate: 95,  amount: 95  },
      { id: "li003", category: "ecg",             label: "ECG / EKG",               qty: 1, unitRate: 75,  amount: 75  },
      { id: "li004", category: "iv_therapy",      label: "IV Therapy",              qty: 2, unitRate: 85,  amount: 170 },
      { id: "li005", category: "nursing_per_day", label: "Nursing Care",            qty: 2, unitRate: 140, amount: 280 },
      { id: "li006", category: "pharmacy",        label: "Amlodipine + Paracetamol",qty: 1, unitRate: 42,  amount: 42  },
    ],
    discount: 0,
    notes: "Hypertension management. BP monitoring required.",
  },
  {
    id: "inv-002",
    patientId:   "p002",
    patientName: "Mei Tanaka",
    patientAge:  32,
    doctorId:    "d001",
    doctorName:  "Dr. Emily Chen",
    bedId:       "GW-02",
    wardCode:    "GW",
    admittedAt:  new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    dischargedAt: null,
    status:      "pending",
    paymentMethod: null,
    paidAt:      null,
    insuranceProvider: "BlueCross BlueShield",
    insuranceClaim:    "CLM-2024-88421",
    lineItems: [
      { id: "li007", category: "consultation",    label: "Post-op Follow-up",         qty: 1, unitRate: 120, amount: 120 },
      { id: "li008", category: "wound_dressing",  label: "Wound Dressing",            qty: 2, unitRate: 65,  amount: 130 },
      { id: "li009", category: "nursing_per_day", label: "Nursing Care",              qty: 1, unitRate: 140, amount: 140 },
      { id: "li010", category: "pharmacy",        label: "Metronidazole + Ibuprofen", qty: 1, unitRate: 38,  amount: 38  },
    ],
    discount: 15,
    notes: "Post-appendectomy. Insurance pre-authorization confirmed.",
  },
  {
    id: "inv-003",
    patientId:   "p003_hist",
    patientName: "Samuel Adeyemi",
    patientAge:  58,
    doctorId:    "d002",
    doctorName:  "Dr. Marcus Webb",
    bedId:       "GW-04",
    wardCode:    "GW",
    admittedAt:  new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    dischargedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    status:      "paid",
    paymentMethod: "insurance",
    paidAt:      new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    insuranceProvider: "Aetna",
    insuranceClaim: "CLM-2024-77301",
    lineItems: [
      { id: "li011", category: "emergency_consult", label: "Emergency Consultation", qty: 1, unitRate: 280, amount: 280 },
      { id: "li012", category: "blood_test",        label: "CBC + Cultures",         qty: 1, unitRate: 95,  amount: 95  },
      { id: "li013", category: "iv_therapy",        label: "IV Antibiotic Therapy",  qty: 3, unitRate: 85,  amount: 255 },
      { id: "li014", category: "nursing_per_day",   label: "Nursing Care",           qty: 3, unitRate: 140, amount: 420 },
      { id: "li015", category: "pharmacy",          label: "Antibiotics course",     qty: 1, unitRate: 78,  amount: 78  },
    ],
    discount: 0,
    notes: "Paid in full via insurance. Claim processed.",
  },
  {
    id: "inv-004",
    patientId:   "p005",
    patientName: "Thomas Brennan",
    patientAge:  71,
    doctorId:    "d007",
    doctorName:  "Dr. James Osei",
    bedId:       "ICU-01",
    wardCode:    "ICU",
    admittedAt:  new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    dischargedAt: null,
    status:      "pending",
    paymentMethod: null,
    paidAt:      null,
    insuranceProvider: "Medicare",
    insuranceClaim: null,
    lineItems: [
      { id: "li016", category: "emergency_consult", label: "Emergency Consultation",  qty: 1, unitRate: 280, amount: 280 },
      { id: "li017", category: "blood_test",        label: "Stroke Panel + Imaging",  qty: 1, unitRate: 95,  amount: 95  },
      { id: "li018", category: "iv_therapy",        label: "IV Thrombolysis",         qty: 2, unitRate: 85,  amount: 170 },
      { id: "li019", category: "nursing_per_day",   label: "ICU Nursing Care",        qty: 2, unitRate: 280, amount: 560 },
      { id: "li020", category: "procedure_minor",   label: "Catheter Placement",      qty: 1, unitRate: 350, amount: 350 },
      { id: "li021", category: "pharmacy",          label: "Anticoagulants + meds",   qty: 1, unitRate: 145, amount: 145 },
    ],
    discount: 0,
    notes: "ICU admission — Medicare pre-authorization pending.",
  },
];

/** Invoice status badge styling */
export const INVOICE_STATUS_STYLES = {
  pending: { bg: "bg-warning-100", text: "text-warning-700", border: "border-warning-300", label: "Pending Payment", dot: "bg-warning-500" },
  paid:    { bg: "bg-success-100", text: "text-success-700", border: "border-success-300", label: "Paid",            dot: "bg-success-500" },
  partial: { bg: "bg-primary-100", text: "text-primary-700", border: "border-primary-300", label: "Partial Payment", dot: "bg-primary-500" },
  waived:  { bg: "bg-surface-100", text: "text-surface-600", border: "border-surface-300", label: "Waived",          dot: "bg-surface-400" },
};

/** Tax rate applied to invoices (8.5%) */
export const TAX_RATE = 0.085;