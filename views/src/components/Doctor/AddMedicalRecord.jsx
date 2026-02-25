// src/components/Doctor/AddMedicalRecord.jsx
// Modal for doctors to add medical records for their patients
import { useState, useEffect } from "react";
import { X, FileText, Save, CheckCircle2, User, Stethoscope } from "lucide-react";
import { pmsAPI, doctorAPI } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";

// Care type options for medical records
const CARE_TYPES = ["Outpatient", "Inpatient"];

// Input styling classes
const inputCls = `
  w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-800 bg-white
  border border-gray-200 placeholder:text-gray-400
  focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500
  transition-colors shadow-sm
`;

export default function AddMedicalRecordModal({ onClose, onSave, preselectedPatient = null }) {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [form, setForm] = useState({
    patient_id: preselectedPatient?.id || "",
    diagnosis: "",
    treatment_plan: "",
    care_type: "Outpatient",
  });

  // Fetch patients list on mount
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const data = await pmsAPI.getPatients();
        const patientList = Array.isArray(data) ? data : data?.data || [];
        setPatients(patientList);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
        setError("Failed to load patients");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Update form field
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Validate form
  const validate = () => {
    if (!form.patient_id) return "Please select a patient";
    if (!form.diagnosis?.trim()) return "Diagnosis is required";
    if (!form.treatment_plan?.trim()) return "Treatment plan is required";
    return null;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const recordData = {
        patient_id: parseInt(form.patient_id),
        doctor_id: user?.id ? parseInt(user.id) : null,
        diagnosis: form.diagnosis.trim(),
        treatment_plan: form.treatment_plan.trim(),
        care_type: form.care_type,
      };
      
      console.log("Creating medical record:", recordData);

      await doctorAPI.createMedicalRecord(recordData);
      setSaved(true);
      
      if (onSave) {
        onSave(recordData);
      }
      
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Failed to create medical record:", err);
      setError(err.message || "Failed to create medical record");
    } finally {
      setSaving(false);
    }
  };

  // Find selected patient for display
  const selectedPatient = patients.find(p => String(p.id) === String(form.patient_id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-green-600">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-white" />
            <h2 className="font-bold text-lg text-white">Add Medical Record</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Success state */}
          {saved ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Record Saved!</h3>
              <p className="text-gray-500 mt-2">Medical record created successfully</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Error display */}
              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Patient selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Patient <span className="text-red-500">*</span>
                </label>
                {loading ? (
                  <div className="text-sm text-gray-400 py-2">Loading patients...</div>
                ) : (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      className={`${inputCls} pl-10 appearance-none`}
                      value={form.patient_id}
                      onChange={(e) => handleChange("patient_id", e.target.value)}
                      disabled={!!preselectedPatient}
                    >
                      <option value="">-- Select Patient --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.first_name} {p.last_name} ({p.patient_id_display || `PAT-${p.id}`})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Selected patient info */}
              {selectedPatient && (
                <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">Selected Patient</p>
                  <p className="text-green-800 font-bold">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </p>
                  <p className="text-xs text-green-600">
                    {selectedPatient.gender} • {selectedPatient.contact_no || "No contact"}
                  </p>
                </div>
              )}

              {/* Care type */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Care Type
                </label>
                <div className="flex gap-2 flex-wrap">
                  {CARE_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleChange("care_type", type)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        form.care_type === type
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    className={`${inputCls} pl-10 resize-none`}
                    rows={3}
                    placeholder="Enter diagnosis (e.g., Hypertension, Type 2 Diabetes)"
                    value={form.diagnosis}
                    onChange={(e) => handleChange("diagnosis", e.target.value)}
                  />
                </div>
              </div>

              {/* Treatment Plan */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Treatment Plan <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={4}
                  placeholder="Enter treatment plan, medications, follow-up instructions..."
                  value={form.treatment_plan}
                  onChange={(e) => handleChange("treatment_plan", e.target.value)}
                />
              </div>

              {/* Doctor info */}
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs text-gray-500">Recording Doctor</p>
                <p className="text-gray-800 font-semibold">{user?.name || "Current Doctor"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!saved && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Record
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
