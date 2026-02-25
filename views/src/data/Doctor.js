// src/data/Doctor.js
// Constants and mock data for the Doctor module.
export const CURRENT_DOCTOR = {
  id: "d001", name: "Dr. Emily Chen",
  specialization: "Internal Medicine", avatar: "EC",
  shiftStart: "08:00", shiftEnd: "17:00",
};

export const DIAGNOSIS_PRESETS = [
  { code: "J06.9",   label: "Acute upper respiratory infection, unspecified" },
  { code: "I10",     label: "Essential (primary) hypertension" },
  { code: "E11.9",   label: "Type 2 diabetes mellitus without complications" },
  { code: "J18.9",   label: "Pneumonia, unspecified organism" },
  { code: "K21.0",   label: "Gastro-oesophageal reflux disease with oesophagitis" },
  { code: "M54.5",   label: "Low back pain" },
  { code: "N39.0",   label: "Urinary tract infection, site not specified" },
  { code: "R51",     label: "Headache" },
  { code: "J45.909", label: "Unspecified asthma, uncomplicated" },
  { code: "I25.10",  label: "Atherosclerotic heart disease" },
  { code: "A09",     label: "Infectious gastroenteritis and colitis" },
  { code: "F32.9",   label: "Major depressive disorder, single episode" },
];

export const MEDICATIONS = [
  { id: "m001", name: "Amoxicillin",   defaultDosage: "500mg" },
  { id: "m002", name: "Paracetamol",   defaultDosage: "1g"    },
  { id: "m003", name: "Ibuprofen",     defaultDosage: "400mg" },
  { id: "m004", name: "Omeprazole",    defaultDosage: "20mg"  },
  { id: "m005", name: "Metformin",     defaultDosage: "500mg" },
  { id: "m006", name: "Lisinopril",    defaultDosage: "10mg"  },
  { id: "m007", name: "Atorvastatin",  defaultDosage: "20mg"  },
  { id: "m008", name: "Salbutamol",    defaultDosage: "100mcg"},
  { id: "m009", name: "Azithromycin",  defaultDosage: "500mg" },
  { id: "m010", name: "Amlodipine",    defaultDosage: "5mg"   },
  { id: "m011", name: "Cetirizine",    defaultDosage: "10mg"  },
  { id: "m012", name: "Metronidazole", defaultDosage: "400mg" },
];

export const DOSAGE_FREQUENCIES = [
  "Once daily","Twice daily","Three times daily","Four times daily",
  "Every 6 hours","Every 8 hours","Every 12 hours","As needed (PRN)","At bedtime",
];
export const DOSAGE_DURATIONS = [
  "3 days","5 days","7 days","10 days","14 days","21 days","28 days","1 month","3 months","Ongoing",
];
export const ROUTES = ["Oral","IV","IM","Topical","Inhaled","Sublingual","Rectal"];

export const LAB_PANELS = [
  "Complete Blood Count (CBC)","Basic Metabolic Panel (BMP)","Lipid Panel",
  "Thyroid Function (TSH, T3, T4)","Liver Function Tests","Urinalysis","HbA1c",
  "Chest X-Ray","ECG / EKG","Blood Culture","Coagulation Panel (PT/INR)","Comprehensive Metabolic Panel",
];

export const APPT_STATUS = {
  waiting:    { label: "Waiting",    bg: "bg-warning-100", text: "text-warning-700", dot: "bg-warning-500",  pulse: true  },
  in_consult: { label: "In Consult", bg: "bg-primary-100", text: "text-primary-700", dot: "bg-primary-500",  pulse: false },
  completed:  { label: "Completed",  bg: "bg-success-100", text: "text-success-700", dot: "bg-success-500",  pulse: false },
  cancelled:  { label: "Cancelled",  bg: "bg-surface-100", text: "text-surface-500", dot: "bg-surface-400",  pulse: false },
};

export const CARE_DECISIONS = {
  outpatient: { label: "Outpatient", sub: "Discharge / Follow-up",    color: "text-success-700", bg: "bg-success-50",  border: "border-success-300", icon: "🏠" },
  inpatient:  { label: "Inpatient",  sub: "Admit · Bed Required",     color: "text-danger-700",  bg: "bg-danger-50",   border: "border-danger-300",  icon: "🏥" },
};

export const INITIAL_APPOINTMENTS = [
  {
    id: "a001", patientId: "p001",
    name: "Carlos Rivera", age: 45, gender: "Male", bloodType: "O+",
    visitType: "Walk-in", appointmentTime: "08:30",
    reason: "Chest pain and shortness of breath",
    status: "completed", bedId: "GW-01", priority: "high",
    vitals: { bp: "148/92", hr: 88, temp: 37.2, spo2: 97, rr: 18, weight: 82, height: 175 },
    allergies: ["Penicillin", "Sulfa drugs"],
    medicalHistory: [
      { date: "2023-11-10", diagnosis: "Hypertension", doctor: "Dr. Emily Chen", notes: "Started on Lisinopril 10mg. BP control improving." },
      { date: "2023-05-22", diagnosis: "Dyslipidemia",  doctor: "Dr. Emily Chen", notes: "Atorvastatin 20mg. Lipid panel in 3 months." },
      { date: "2022-08-14", diagnosis: "Chest pain (non-cardiac)", doctor: "Dr. Marcus Webb", notes: "ECG and troponin normal. Musculoskeletal origin." },
    ],
    currentMeds: ["Lisinopril 10mg OD", "Atorvastatin 20mg OD"],
    diagnosis: { code: "I10", label: "Essential (primary) hypertension", notes: "BP poorly controlled. Consider dose adjustment or adding CCB.", severity: "moderate" },
    careDecision: "inpatient",
    prescriptions: [
      { id: "rx001", med: "Amlodipine",  dosage: "5mg", frequency: "Once daily",      duration: "28 days", route: "Oral", notes: "Add to existing antihypertensive regimen" },
      { id: "rx002", med: "Paracetamol", dosage: "1g",  frequency: "As needed (PRN)", duration: "7 days",  route: "Oral", notes: "For chest wall pain" },
    ],
    labOrders: ["ECG / EKG", "Basic Metabolic Panel (BMP)"],
    treatmentNotes: "Monitor BP twice daily. Salt restriction <2g/day. Cardiology referral if no improvement in 2 weeks.",
  },
  {
    id: "a002", patientId: "p002",
    name: "Mei Tanaka", age: 32, gender: "Female", bloodType: "A+",
    visitType: "Appointment", appointmentTime: "09:15",
    reason: "Post-operative follow-up — appendectomy",
    status: "completed", bedId: "GW-02", priority: "normal",
    vitals: { bp: "112/72", hr: 74, temp: 36.8, spo2: 99, rr: 14, weight: 58, height: 162 },
    allergies: [],
    medicalHistory: [
      { date: "2024-01-15", diagnosis: "Acute appendicitis", doctor: "Dr. Robert Kim", notes: "Emergency laparoscopic appendectomy. No complications." },
    ],
    currentMeds: ["Metronidazole 400mg TDS", "Paracetamol 1g QID"],
    diagnosis: { code: "Z09", label: "Encounter for follow-up examination", notes: "Wound healing well. Pain VAS 2/10. Continue antibiotics.", severity: "low" },
    careDecision: "outpatient",
    prescriptions: [
      { id: "rx003", med: "Metronidazole", dosage: "400mg", frequency: "Three times daily", duration: "5 days", route: "Oral", notes: "Complete the course" },
      { id: "rx004", med: "Ibuprofen",     dosage: "400mg", frequency: "Three times daily", duration: "5 days", route: "Oral", notes: "Take with food" },
    ],
    labOrders: [],
    treatmentNotes: "Wound review in 7 days. Resume normal activity gradually. No heavy lifting for 4 weeks.",
  },
  {
    id: "a003", patientId: "p004",
    name: "Priya Nair", age: 27, gender: "Female", bloodType: "AB-",
    visitType: "Appointment", appointmentTime: "10:00",
    reason: "Asthma management review",
    status: "in_consult", bedId: null, priority: "normal",
    vitals: { bp: "118/76", hr: 80, temp: 37.0, spo2: 95, rr: 20, weight: 54, height: 165 },
    allergies: ["NSAIDs", "Aspirin"],
    medicalHistory: [
      { date: "2023-09-05", diagnosis: "Moderate persistent asthma", doctor: "Dr. Emily Chen", notes: "Stepped up to ICS/LABA. FEV1 72% predicted." },
      { date: "2023-03-18", diagnosis: "Allergic rhinitis", doctor: "Dr. Emily Chen", notes: "Cetirizine PRN. Refer to allergy clinic." },
    ],
    currentMeds: ["Salbutamol 100mcg inhaler PRN", "Budesonide/Formoterol 160/4.5mcg BD"],
    diagnosis: null, careDecision: null, prescriptions: [], labOrders: [], treatmentNotes: "",
  },
  {
    id: "a004", patientId: "p006",
    name: "Kwame Osei", age: 52, gender: "Male", bloodType: "B+",
    visitType: "Walk-in", appointmentTime: "11:30",
    reason: "Persistent cough and fatigue for 3 weeks",
    status: "waiting", bedId: null, priority: "high",
    vitals: { bp: "130/84", hr: 92, temp: 37.6, spo2: 94, rr: 22, weight: 90, height: 180 },
    allergies: ["Codeine"],
    medicalHistory: [],
    currentMeds: [],
    diagnosis: null, careDecision: null, prescriptions: [], labOrders: [], treatmentNotes: "",
  },
  {
    id: "a005", patientId: "p007",
    name: "Ingrid Svensson", age: 38, gender: "Female", bloodType: "O-",
    visitType: "Appointment", appointmentTime: "13:00",
    reason: "Annual check-up + lipid review",
    status: "waiting", bedId: null, priority: "normal",
    vitals: { bp: "126/80", hr: 68, temp: 36.6, spo2: 98, rr: 14, weight: 65, height: 170 },
    allergies: [],
    medicalHistory: [
      { date: "2022-12-01", diagnosis: "Dyslipidemia", doctor: "Dr. Emily Chen", notes: "Lifestyle modification. Recheck in 12 months." },
    ],
    currentMeds: [],
    diagnosis: null, careDecision: null, prescriptions: [], labOrders: [], treatmentNotes: "",
  },
];