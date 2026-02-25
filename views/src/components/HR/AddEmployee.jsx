import { useState, useEffect } from "react";
import {
  X, User, Mail, Phone, Building2, Briefcase, Clock,
  ChevronRight, ChevronLeft, CheckCircle2, Stethoscope,
  Calendar, AlertCircle,
} from "lucide-react";

import {
  DEPARTMENTS, ROLES, SPECIALIZATIONS, SHIFT_TEMPLATES, STATUS_OPTIONS,
} from "../../data/HR";

const STEPS = [
  { id: 1, label: "Personal Info",   icon: User },
  { id: 2, label: "Role & Schedule", icon: Briefcase },
  { id: 3, label: "Review",          icon: CheckCircle2 },
];

/** Default department for each role to keep form in sync */
const ROLE_DEFAULT_DEPT = {
  Doctor:      "Internal Medicine",
  Nurse:       "Surgery",
  HR:          "Human Resources",
  FrontDesk:   "Front Office",
  Pharmacist:  "Pharmacy",
  Radiologist: "Radiology",
  Technician:  "Radiology",
  Admin:       "Human Resources",
};

/** Generate corporate email based on role */
const generateCorporateEmail = (firstName, lastName, role) => {
  if (!firstName || !lastName) return "";
  const name = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/\s+/g, "");
  const domainMap = {
    Doctor:    "medical.gnehospital.com",
    HR:        "hr.gnehospital.com",
    FrontDesk: "frontdesk.gnehospital.com",
    Nurse:     "nursing.gnehospital.com",
    Admin:     "admin.gnehospital.com",
    default:   "staff.gnehospital.com",
  };
  return `${name}@${domainMap[role] ?? domainMap.default}`;
};

/** Validation Input */
const isValidPHPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-]/g, "");
  if (cleaned.length > 15) return false;
  return /^(\+63|0)\d{9,12}$/.test(cleaned);
};


const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPTY_FORM = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  contact_no: "",
  address: "",
  role: "Doctor",
  department: "Internal Medicine",
  status: "Active",
  prc_license_no: "",
  hire_date: new Date().toISOString().split('T')[0],
  shiftStart: "08:00",
  shiftEnd: "17:00",
  workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], // Default weekdays
};

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all
              ${active ? "bg-[#0e93b1] text-white shadow-md shadow-cyan-100" : ""}
              ${done ? "bg-green-100 text-green-700" : ""}
              ${!active && !done ? "text-gray-400" : ""}
            `}>
              <span className={`
                flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold
                ${active ? "bg-white text-[#0e93b1]" : ""}
                ${done ? "bg-green-500 text-white" : ""}
                ${!active && !done ? "bg-gray-200 text-gray-500" : ""}
              `}>
                {done ? "✓" : step.id}
              </span>
              <span className="hidden sm:block">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 transition-colors ${done ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldGroup({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls = `
  w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-800 bg-white
  border border-gray-200 placeholder:text-gray-400
  focus:outline-none focus:ring-2 focus:ring-[#0e93b1]/25 focus:border-[#0e93b1]
  transition-colors shadow-sm
`;

function Step1({ form, onChange, errors }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="First Name" required>
          <input
            className={`${inputCls} ${errors.first_name ? "border-red-400 ring-2 ring-red-100" : ""}`}
            placeholder="John"
            value={form.first_name}
            onChange={(e) => onChange("first_name", e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="Middle Name">
          <input
            className={inputCls}
            placeholder="Quincy"
            value={form.middle_name}
            onChange={(e) => onChange("middle_name", e.target.value)}
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Last Name" required>
        <input
          className={`${inputCls} ${errors.last_name ? "border-red-400 ring-2 ring-red-100" : ""}`}
          placeholder="Doe"
          value={form.last_name}
          onChange={(e) => onChange("last_name", e.target.value)}
        />
      </FieldGroup>

      <FieldGroup label="Personal Email Address" required hint="Employee's personal email for initial contact">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            className={`${inputCls} pl-10 ${errors.email ? "border-red-400 ring-2 ring-red-100" : ""}`}
            placeholder="john.doe@gmail.com"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </div>
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Contact Number" required hint="PH format: 09XXXXXXXXX">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className={`${inputCls} pl-10 ${errors.contact_no ? "border-red-400 ring-2 ring-red-100" : ""}`}
              placeholder="09XXXXXXXXX"
              maxLength={15}
              value={form.contact_no}
              onChange={(e) => onChange("contact_no", e.target.value.replace(/[^0-9+\-\s]/g, ""))}
            />
          </div>
          {errors.contact_no && <p className="mt-1 text-xs text-red-500">{errors.contact_no}</p>}
        </FieldGroup>
        <FieldGroup label="Hire Date" required>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              className={`${inputCls} pl-10`}
              value={form.hire_date}
              onChange={(e) => onChange("hire_date", e.target.value)}
            />
          </div>
        </FieldGroup>
      </div>

      <FieldGroup label="Home Address" required>
        <input
          className={inputCls}
          placeholder="House No., Street, Barangay, City"
          value={form.address}
          onChange={(e) => onChange("address", e.target.value)}
        />
      </FieldGroup>
    </div>
  );
}

function Step2({ form, onChange }) {
  const isDoctor = form.role === "Doctor";

  // When role changes, auto-set a sensible default department and update email
  const handleRoleChange = (newRole) => {
    onChange("role", newRole);
    const defaultDept = ROLE_DEFAULT_DEPT[newRole];
    if (defaultDept) onChange("department", defaultDept);
  };

  return (
    <div className="space-y-4">
      <FieldGroup label="System Role" required>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                form.role === r ? "bg-[#0e93b1] border-[#0e93b1] text-white" : "bg-white border-gray-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Department" required>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            className={`${inputCls} pl-10 appearance-none`}
            value={form.department}
            onChange={(e) => onChange("department", e.target.value)}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </FieldGroup>

      <FieldGroup label="Employment Status" required>
        <select
          className={`${inputCls} appearance-none`}
          value={form.status}
          onChange={(e) => onChange("status", e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </FieldGroup>

      {isDoctor && (
        <FieldGroup label="PRC License Number" required hint="Required for PH medical verification">
          <div className="relative">
            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              className={`${inputCls} pl-10`}
              placeholder="0123456"
              value={form.prc_license_no}
              onChange={(e) => onChange("prc_license_no", e.target.value)}
            />
          </div>
        </FieldGroup>
      )}

      <FieldGroup label="Shift Schedule">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Start Time</label>
            <input type="time" className={inputCls} value={form.shiftStart} onChange={(e) => onChange("shiftStart", e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">End Time</label>
            <input type="time" className={inputCls} value={form.shiftEnd} onChange={(e) => onChange("shiftEnd", e.target.value)} />
          </div>
        </div>
      </FieldGroup>

      <FieldGroup label="Work Days" required hint="Select days the employee will work">
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = form.workDays?.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  const current = form.workDays || [];
                  const updated = isSelected
                    ? current.filter((d) => d !== day)
                    : [...current, day];
                  onChange("workDays", updated);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                  isSelected
                    ? "bg-[#0e93b1] border-[#0e93b1] text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {day.substring(0, 3)}
              </button>
            );
          })}
        </div>
      </FieldGroup>
    </div>
  );
}

function Step3({ form }) {
  const corporateEmail = generateCorporateEmail(form.first_name, form.last_name, form.role);
  
  // Format work days for display
  const workDaysDisplay = form.workDays?.length
    ? form.workDays.map(d => d.substring(0, 3)).join(', ')
    : 'None selected';
  
  const fields = [
    { label: "Full Name",       value: [form.first_name, form.middle_name, form.last_name].filter(Boolean).join(" ") },
    { label: "Personal Email",  value: form.email },
    { label: "Corporate Email", value: corporateEmail, highlight: true },
    { label: "Contact No.",     value: form.contact_no },
    { label: "Role",            value: form.role },
    { label: "Department",      value: form.department },
    { label: "Status",          value: form.status },
    { label: "Work Days",       value: workDaysDisplay },
    { label: "Shift",           value: `${form.shiftStart} – ${form.shiftEnd}` },
    { label: "Hire Date",       value: form.hire_date },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-[#0e93b1] px-5 py-3 text-white">
          <p className="text-sm font-semibold">Review Employee Details</p>
        </div>
        <div className="divide-y divide-gray-100">
          {fields.map((f) => (
            <div key={f.label} className={`flex justify-between px-5 py-3 text-sm ${f.highlight ? "bg-cyan-50" : ""}`}>
              <span className="text-gray-500 font-medium">{f.label}</span>
              <span className={`font-semibold ${f.highlight ? "text-[#0e93b1]" : "text-gray-900"}`}>{f.value}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3">
        <p className="text-xs text-cyan-700">
          <strong>Note:</strong> The corporate email <span className="font-mono bg-cyan-100 px-1 rounded">{corporateEmail}</span> will be created automatically upon onboarding completion.
        </p>
      </div>
    </div>
  );
}

export default function AddEmployeeModal({ onClose, onSave, initialData = null }) {
  const isEditing = !!initialData;

  // Build an EMPTY_FORM from initialData if provided (editing) or defaults (adding)
  const buildInitial = () => {
    if (!initialData) return EMPTY_FORM;
    const nameParts = (initialData.name || "").split(" ");
    return {
      first_name:     nameParts[0]                    || "",
      middle_name:    nameParts.length > 2 ? nameParts[1] : "",
      last_name:      nameParts[nameParts.length - 1] || "",
      email:          initialData.email               || "",
      contact_no:     initialData.phone               || "",
      address:        initialData.address             || "",
      role:           initialData.role                || "Doctor",
      department:     initialData.department          || "Internal Medicine",
      status:         initialData.status              || "Active",
      prc_license_no: initialData.prc_license_no      || "",
      hire_date:      initialData.joined              || new Date().toISOString().split("T")[0],
      shiftStart:     initialData.shiftStart          || "08:00",
      shiftEnd:       initialData.shiftEnd            || "17:00",
      workDays:       initialData.workDays            || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    };
  };

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(buildInitial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const onChange = (field, value) => {
    setForm((p) => {
      const updated = { ...p, [field]: value };
      // No auto-generation of email - user enters personal email
      return updated;
    });
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.first_name?.trim()) e.first_name = "Required";
    if (!form.last_name?.trim())  e.last_name  = "Required";
    if (!form.email?.trim()) {
      e.email = "Required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email address";
    }
    // Phone validation
    if (!form.contact_no?.trim()) {
      e.contact_no = "Required";
    } else if (!isValidPHPhone(form.contact_no)) {
      e.contact_no = "Enter valid PH number (09XXXXXXXXX), max 15 chars";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      setDone(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-900">
            {isEditing ? "Edit Employee" : "Add New Employee"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X /></button>
        </div>

        <div className="bg-gray-50 px-6 py-3 border-b">
          <StepIndicator current={step} />
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {done ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold">
                {isEditing ? "Changes Saved!" : "Onboarding Successful"}
              </h3>
            </div>
          ) : (
            <>
              {step === 1 && <Step1 form={form} onChange={onChange} errors={errors} />}
              {step === 2 && <Step2 form={form} onChange={onChange} />}
              {step === 3 && <Step3 form={form} />}
            </>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="px-4 py-2 text-gray-600 disabled:opacity-50 flex items-center"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => { if (validate()) setStep((s) => s + 1); }}
              className="bg-[#0e93b1] text-white px-6 py-2 rounded-xl flex items-center"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded-xl disabled:opacity-50"
            >
              {saving ? "Saving…" : isEditing ? "Save Changes" : "Confirm & Add"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}