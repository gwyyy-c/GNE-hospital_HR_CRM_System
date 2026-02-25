import { useState, useEffect } from "react";
import {
  X, User, Mail, Phone, Calendar, Droplets, AlertCircle,
  Save, ChevronDown, CheckCircle2, Heart, FileText,
} from "lucide-react";
import { GENDERS, BLOOD_TYPES } from "../../data/pmsData";

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

export default function PatientEditForm({ patient, onClose, onSave }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Male",
    blood_type: "Unknown",
    address: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Initialize form with patient data
  useEffect(() => {
    if (patient) {
      setForm({
        first_name: patient.first_name ?? "",
        last_name: patient.last_name ?? "",
        email: patient.email ?? "",
        phone: patient.contact_no ?? patient.phone ?? "",
        dob: patient.dob ? patient.dob.split("T")[0] : "",
        gender: patient.gender ?? "Male",
        blood_type: patient.blood_type ?? "Unknown",
        address: patient.address ?? "",
        emergency_contact_name: patient.emergency_contact_name ?? "",
        emergency_contact_number: patient.emergency_contact_number ?? "",
      });
    }
  }, [patient]);

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "First name is required.";
    if (!form.last_name.trim()) e.last_name = "Last name is required.";
    
    // Phone validation
    if (form.phone && form.phone.length > 15) {
      e.phone = "Contact number must be 15 characters or less.";
    }
    
    // Email validation
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email address.";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        contact_no: form.phone.trim(),
        dob: form.dob || null,
        gender: form.gender,
        blood_type: form.blood_type,
        address: form.address.trim(),
        emergency_contact_name: form.emergency_contact_name.trim(),
        emergency_contact_number: form.emergency_contact_number.trim(),
      };
      
      await onSave(patient.id, payload);
      setSuccess(true);
    } catch (err) {
      console.error("Failed to update patient:", err);
      setErrors({ submit: "Failed to update patient. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-success-600" />
          </div>
          <h3 className="font-display text-xl font-bold text-surface-900 mb-1">Patient Updated</h3>
          <p className="text-sm text-surface-500 mb-6">
            <strong>{form.first_name} {form.last_name}</strong>'s information has been updated.
          </p>
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
              <User className="w-5 h-5 text-primary-600" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">Edit Patient Information</h2>
              <p className="text-xs text-surface-500">
                Patient ID: {patient?.patient_id_display ?? `PAT-${String(patient?.id ?? 0).padStart(3, "0")}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 text-surface-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {errors.submit && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-xl">
              <p className="text-sm text-danger-700">{errors.submit}</p>
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>First Name</FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="First Name"
                  className={`${inputCls} pl-10 ${errors.first_name ? "border-danger-400" : ""}`}
                  value={form.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                />
              </div>
              <ErrorMsg msg={errors.first_name} />
            </div>
            <div>
              <FieldLabel required>Last Name</FieldLabel>
              <input
                type="text"
                placeholder="Last Name"
                className={`${inputCls} ${errors.last_name ? "border-danger-400" : ""}`}
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
              />
              <ErrorMsg msg={errors.last_name} />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Email</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="email"
                  placeholder="email@gmail.com"
                  className={`${inputCls} pl-10 ${errors.email ? "border-danger-400" : ""}`}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <ErrorMsg msg={errors.email} />
            </div>
            <div>
              <FieldLabel>Contact Number</FieldLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="tel"
                  placeholder="09XXXXXXXXX"
                  className={`${inputCls} pl-10 ${errors.phone ? "border-danger-400" : ""}`}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
              <ErrorMsg msg={errors.phone} />
            </div>
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FieldLabel>Date of Birth</FieldLabel>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="date"
                  className={`${inputCls} pl-10`}
                  value={form.dob}
                  onChange={(e) => set("dob", e.target.value)}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Gender</FieldLabel>
              <div className="relative">
                <select
                  className={selectCls}
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <FieldLabel>Blood Type</FieldLabel>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <select
                  className={`${selectCls} pl-10`}
                  value={form.blood_type}
                  onChange={(e) => set("blood_type", e.target.value)}
                >
                  {BLOOD_TYPES.map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <FieldLabel>Address</FieldLabel>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-surface-400" />
              <textarea
                rows={2}
                placeholder="Complete address"
                className={`${inputCls} pl-10 resize-none`}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-4 rounded-xl bg-warning-50 border border-warning-200">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-warning-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-warning-700">
                Emergency Contact
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Contact Name</FieldLabel>
                <input
                  type="text"
                  placeholder="Emergency contact name"
                  className={inputCls}
                  value={form.emergency_contact_name}
                  onChange={(e) => set("emergency_contact_name", e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Contact Number</FieldLabel>
                <input
                  type="tel"
                  placeholder="Phone number"
                  className={inputCls}
                  value={form.emergency_contact_number}
                  onChange={(e) => set("emergency_contact_number", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-200 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-surface-300 text-surface-700 font-semibold text-sm hover:bg-surface-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
