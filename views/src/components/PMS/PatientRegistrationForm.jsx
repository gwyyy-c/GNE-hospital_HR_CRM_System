import { useState } from "react";
import {
  X, User, Mail, Phone, Calendar, Droplets, AlertCircle,
  UserPlus, ClipboardList, Heart, ChevronDown, CheckCircle2,
  Zap, Clock, FileText, PhoneCall,
} from "lucide-react";
import { VISIT_TYPES, GENDERS, BLOOD_TYPES } from "../../data/pmsData";

// Quick Presets for Reason for Visit
const REASONS_PRESETS = [
  "Chest pain and shortness of breath",
  "High fever and chills",
  "Severe headache and dizziness",
  "Abdominal pain / nausea",
  "Fracture / trauma",
  "Post-operative follow-up",
  "Routine check-up",
  "Asthma / breathing difficulty",
  "Stroke symptoms",
  "Allergic reaction",
];

// Visit type 
const VISIT_TYPE_META = {
  "Walk-in":     { icon: Zap,      color: "text-warning-600",  bg: "bg-warning-50",   border: "border-warning-300",   desc: "Unscheduled visit" },
  "Appointment": { icon: Calendar, color: "text-primary-600",  bg: "bg-primary-50",   border: "border-primary-300",   desc: "Scheduled appointment" },
};

const EMPTY_FORM = {
  name: "", dateOfBirth: "", age: "", gender: "Male", phone: "", email: "",
  bloodType: "Unknown", visitType: "Walk-in",
  reason: "", emergencyContact: "", notes: "",
  // Appointment fields
  appointmentDoctor: "",
  appointmentDate: "",
  appointmentTime: "",
};

const inputCls = `
  w-full px-3.5 py-2.5 rounded-xl text-sm text-surface-800 bg-white
  border border-surface-200 placeholder:text-surface-400
  focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
  transition-colors shadow-sm
`;

const selectCls = `${inputCls} appearance-none`;

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-1.5">
      {children}{required && <span className="text-danger-500 ml-0.5">*</span>}
    </label>
  );
}

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-[11px] text-danger-600 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />{msg}
    </p>
  );
}

export default function PatientRegistrationForm({ onClose, onRegister, doctors = [] }) {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name   = "Patient name is required.";
    if (!form.dateOfBirth)   e.dateOfBirth = "Date of birth is required.";
    if (!form.age || isNaN(form.age) || +form.age < 0 || +form.age > 130)
                             e.age    = "Enter your age.";
    // Phone validation
    if (!form.phone.trim()) {
      e.phone = "Contact number is required.";
    } else if (form.phone.length > 15) {
      e.phone = "Contact number must be 15 characters or less.";
    } else if (!/^(\+63|0)\d{9,12}$/.test(form.phone.replace(/[\s\-]/g, ""))) {
      e.phone = "Enter valid PH number (09XXXXXXXXX or +63XXXXXXXXXX).";
    }
    if (!form.visitType)     e.visitType = "Select a visit type.";
    if (!form.reason.trim()) e.reason = "Reason for visit is required.";
    
    // Appointment-specific validation
    if (form.visitType === "Appointment") {
      if (!form.appointmentDoctor) e.appointmentDoctor = "Select a doctor.";
      if (!form.appointmentDate)   e.appointmentDate = "Select appointment date.";
      if (!form.appointmentTime)   e.appointmentTime = "Select appointment time.";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    const id = onRegister({ ...form, age: +form.age });
    setSaving(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-success-600" />
          </div>
          <h3 className="font-display text-xl font-bold text-surface-900 mb-1">Patient Registered</h3>
          <p className="text-sm text-surface-500 mb-1">
            <strong>{form.name}</strong> has been added to the queue.
          </p>
          <p className="text-xs text-surface-400 mb-6">Status: <span className="text-warning-600 font-semibold">Waiting</span> — assign a doctor &amp; bed next.</p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary-600" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">Register New Patient</h2>
              <p className="text-xs text-surface-500">Complete all required fields to add to queue</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 text-surface-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* ── Visit Type Selector ── */}
          <div>
            <FieldLabel required>Type of Visit</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VISIT_TYPES.map((vt) => {
                const meta = VISIT_TYPE_META[vt];
                const Icon = meta.icon;
                const active = form.visitType === vt;
                return (
                  <button
                    key={vt}
                    type="button"
                    onClick={() => set("visitType", vt)}
                    className={`
                      flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2
                      text-xs font-semibold transition-all
                      ${active
                        ? `${meta.bg} ${meta.border} ${meta.color} shadow-sm`
                        : "bg-white border-surface-200 text-surface-500 hover:border-surface-300"
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${active ? meta.color : "text-surface-400"}`} />
                    {vt}
                    <span className={`text-[10px] font-normal ${active ? meta.color : "text-surface-400"}`}>
                      {meta.desc}
                    </span>
                  </button>
                );
              })}
            </div>
            <ErrorMsg msg={errors.visitType} />
          </div>

          {/* ── Appointment Details */}
          {form.visitType === "Appointment" && (
            <div className="p-4 rounded-xl bg-primary-50 border border-primary-200">
              <div className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Appointment Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <FieldLabel required>Doctor</FieldLabel>
                  <div className="relative">
                    <select 
                      className={`${selectCls} ${errors.appointmentDoctor ? "border-danger-400" : ""}`} 
                      value={form.appointmentDoctor} 
                      onChange={(e) => set("appointmentDoctor", e.target.value)}
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doc) => (
                        <option key={doc.id ?? doc.doctor_id} value={doc.id ?? doc.doctor_id}>
                          {doc.name ?? `${doc.first_name ?? ""} ${doc.last_name ?? ""}`.trim() ?? "Unknown"}
                          {doc.specialty ? ` (${doc.specialty})` : doc.specialization ? ` (${doc.specialization})` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                  </div>
                  <ErrorMsg msg={errors.appointmentDoctor} />
                </div>
                <div>
                  <FieldLabel required>Date</FieldLabel>
                  <input 
                    type="date" 
                    className={`${inputCls} ${errors.appointmentDate ? "border-danger-400" : ""}`}
                    value={form.appointmentDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => set("appointmentDate", e.target.value)}
                  />
                  <ErrorMsg msg={errors.appointmentDate} />
                </div>
                <div>
                  <FieldLabel required>Time</FieldLabel>
                  <input 
                    type="time" 
                    className={`${inputCls} ${errors.appointmentTime ? "border-danger-400" : ""}`}
                    value={form.appointmentTime}
                    onChange={(e) => set("appointmentTime", e.target.value)}
                  />
                  <ErrorMsg msg={errors.appointmentTime} />
                </div>
              </div>
            </div>
          )}

          {/* ── Personal Info ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FieldLabel required>Full Name</FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                <input className={`${inputCls} pl-10 ${errors.name ? "border-danger-400" : ""}`}
                  placeholder="e.g. Carlos Rivera"
                  value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <ErrorMsg msg={errors.name} />
            </div>

            <div>
              <FieldLabel required>Date of Birth</FieldLabel>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                <input 
                  type="date" 
                  className={`${inputCls} pl-10 ${errors.dateOfBirth ? "border-danger-400" : ""}`}
                  value={form.dateOfBirth}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    set("dateOfBirth", e.target.value);
                    // Auto-calculate age from date of birth
                    if (e.target.value) {
                      const today = new Date();
                      const birth = new Date(e.target.value);
                      let age = today.getFullYear() - birth.getFullYear();
                      const monthDiff = today.getMonth() - birth.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                        age--;
                      }
                      set("age", age.toString());
                    }
                  }}
                />
              </div>
              <ErrorMsg msg={errors.dateOfBirth} />
            </div>

            <div>
              <FieldLabel required>Age</FieldLabel>
              <input className={`${inputCls} ${errors.age ? "border-danger-400" : ""}`}
                type="number" min="0" max="130" placeholder="Auto-calculated"
                value={form.age} onChange={(e) => set("age", e.target.value)} 
                readOnly={!!form.dateOfBirth} />
              <ErrorMsg msg={errors.age} />
            </div>

            <div>
              <FieldLabel>Gender</FieldLabel>
              <div className="relative">
                <select className={selectCls} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  {GENDERS.map((g) => <option key={g}>{g}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <FieldLabel required>Contact Number</FieldLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                <input className={`${inputCls} pl-10 ${errors.phone ? "border-danger-400" : ""}`}
                  placeholder="09XXXXXXXXX"
                  maxLength={15}
                  value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/[^0-9+\-\s]/g, ""))} />
              </div>
              <ErrorMsg msg={errors.phone} />
            </div>

            <div>
              <FieldLabel required>Email</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                <input className={`${inputCls} pl-10`} type="email" placeholder="patient@email.com"
                  value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
            </div>

            <div>
              <FieldLabel>Blood Type</FieldLabel>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-danger-400 pointer-events-none" />
                <select className={`${selectCls} pl-10`} value={form.bloodType} onChange={(e) => set("bloodType", e.target.value)}>
                  {BLOOD_TYPES.map((bt) => <option key={bt}>{bt}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <FieldLabel>Emergency Contact Name</FieldLabel>
              <div className="relative">
                <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                <input className={`${inputCls} pl-10`}
                  placeholder="Contact Name"
                  value={form.emergencyContactName} onChange={(e) => set("emergencyContactName", e.target.value)} />
              </div>
            </div>
          </div>

              <div>
              <FieldLabel required>Emergency Contact Number</FieldLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                <input className={`${inputCls} pl-10 ${errors.emergencyContact ? "border-danger-400" : ""}`}
                  placeholder="09XXXXXXXXX"
                  maxLength={15}
                  value={form.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value.replace(/[^0-9+\-\s]/g, ""))} />
              </div>
              <ErrorMsg msg={errors.emergencyContact} />
            </div>

          {/* Reason for Visit */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel required>Reason for Visit</FieldLabel>
              <button
                type="button"
                onClick={() => setShowPresets((p) => !p)}
                className="text-[11px] text-primary-600 hover:text-primary-700 font-semibold"
              >
                {showPresets ? "Hide" : "Quick Presets ▾"}
              </button>
            </div>

            {showPresets && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {REASONS_PRESETS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { set("reason", r); setShowPresets(false); }}
                    className="px-2.5 py-1 rounded-lg text-xs bg-surface-100 hover:bg-primary-50 hover:text-primary-700 text-surface-600 border border-surface-200 hover:border-primary-200 transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-surface-400 pointer-events-none" />
              <textarea
                className={`${inputCls} pl-10 resize-none ${errors.reason ? "border-danger-400" : ""}`}
                rows={3}
                placeholder="Describe the patient's primary complaint or reason for this visit…"
                value={form.reason}
                onChange={(e) => set("reason", e.target.value)}
              />
            </div>
            <ErrorMsg msg={errors.reason} />
          </div>

          {/*  Additional Notes */}
          <div>
            <FieldLabel>Additional Notes</FieldLabel>
            <textarea
              className={`${inputCls} resize-none`}
              rows={2}
              placeholder="Allergies, prior conditions, medications, etc."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200 bg-surface-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-70"
          >
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Registering…</>
              : <><UserPlus className="w-4 h-4" />Register Patient</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}