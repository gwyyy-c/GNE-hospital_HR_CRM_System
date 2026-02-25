// src/components/Doctor/PatientConsult.jsx
import { useState, useCallback } from "react";
import {
  History, Stethoscope, Pill, Plus, Trash2, Save,
  AlertCircle, CheckCircle2, FileText, FlaskConical,
  Droplets, Weight, Ruler, Activity, Heart, Thermometer,
  Wind, ChevronDown, X,
} from "lucide-react";
import {
  DIAGNOSIS_PRESETS, MEDICATIONS, DOSAGE_FREQUENCIES,
  DOSAGE_DURATIONS, ROUTES, LAB_PANELS,
} from "../../data/Doctor";

// ── Shared input style ─────────────────────────────────────────────────────────
const inputCls = `
  w-full px-3.5 py-2.5 rounded-xl text-sm text-surface-800 bg-white
  border border-surface-200 placeholder:text-surface-400
  focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
  transition-colors shadow-sm
`;
const selectCls = `${inputCls} appearance-none`;

// ── TAB A: Medical History ─────────────────────────────────────────────────────
function MedicalHistoryTab({ appt }) {
  const vitals = appt.vitals;

  const VitalCard = ({ label, value, unit, icon: Icon, colorClass, subtext }) => (
    <div className={`flex flex-col p-4 rounded-xl border ${colorClass ?? "bg-surface-50 border-surface-200"}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-surface-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500">{label}</span>
      </div>
      <p className="font-display text-xl font-bold text-surface-900">{value}</p>
      {unit && <p className="text-xs text-surface-500">{unit}</p>}
      {subtext && <p className="text-xs font-medium text-danger-600 mt-0.5">{subtext}</p>}
    </div>
  );

  const spo2Warn  = vitals.spo2 < 95;
  const hrWarn    = vitals.hr > 100;
  const bpWarn    = parseInt(vitals.bp) > 140;
  const tempWarn  = vitals.temp > 37.5;

  return (
    <div className="space-y-6">
      {/* Allergies banner */}
      {appt.allergies.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 bg-danger-50 border border-danger-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-danger-800">Known Allergies</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {appt.allergies.map((a) => (
                <span key={a} className="px-2.5 py-0.5 rounded-full bg-danger-100 text-danger-700 text-xs font-semibold">{a}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vitals grid */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-surface-500 mb-3">Current Vitals</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <VitalCard label="Blood Pressure" value={vitals.bp} unit="mmHg"
            icon={Activity} colorClass={bpWarn ? "bg-danger-50 border-danger-200" : "bg-surface-50 border-surface-200"}
            subtext={bpWarn ? "⚠ Hypertensive" : null} />
          <VitalCard label="Heart Rate" value={vitals.hr} unit="bpm"
            icon={Heart} colorClass={hrWarn ? "bg-danger-50 border-danger-200" : "bg-surface-50 border-surface-200"}
            subtext={hrWarn ? "⚠ Tachycardia" : null} />
          <VitalCard label="SpO₂" value={`${vitals.spo2}%`} unit="Pulse ox"
            icon={Wind} colorClass={spo2Warn ? "bg-danger-50 border-danger-200" : "bg-surface-50 border-surface-200"}
            subtext={spo2Warn ? "⚠ Low oxygen" : null} />
          <VitalCard label="Temperature" value={`${vitals.temp}°C`} unit="Oral"
            icon={Thermometer} colorClass={tempWarn ? "bg-warning-50 border-warning-200" : "bg-surface-50 border-surface-200"}
            subtext={tempWarn ? "⚠ Low-grade fever" : null} />
          <VitalCard label="Resp. Rate" value={vitals.rr} unit="breaths/min" icon={Wind} />
          <VitalCard label="Weight"  value={`${vitals.weight}kg`} unit={`BMI: ${(vitals.weight / ((vitals.height/100)**2)).toFixed(1)}`} icon={Weight} />
          <VitalCard label="Height"  value={`${vitals.height}cm`} unit="" icon={Ruler} />
          <VitalCard label="Blood Type" value={appt.bloodType} unit="" icon={Droplets} />
        </div>
      </div>

      {/* Current medications */}
      {appt.currentMeds.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-surface-500 mb-3">Current Medications</h3>
          <div className="space-y-2">
            {appt.currentMeds.map((med) => (
              <div key={med} className="flex items-center gap-2.5 px-4 py-2.5 bg-primary-50 border border-primary-100 rounded-xl">
                <Pill className="w-4 h-4 text-primary-400 shrink-0" />
                <span className="text-sm text-primary-800 font-medium">{med}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical history timeline */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-surface-500 mb-3">Visit History</h3>
        {appt.medicalHistory.length === 0 ? (
          <div className="flex items-center gap-2.5 px-4 py-4 bg-surface-50 rounded-xl border border-surface-200">
            <History className="w-5 h-5 text-surface-300" />
            <p className="text-sm text-surface-400">No previous visit records on file.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-surface-200" />
            <div className="space-y-4">
              {appt.medicalHistory.map((h, i) => (
                <div key={i} className="relative flex gap-4">
                  <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-primary-200 shrink-0">
                    <Stethoscope className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-surface-900">{h.diagnosis}</p>
                        <p className="text-xs text-surface-500">{h.doctor}</p>
                      </div>
                      <time className="text-[11px] text-surface-400 whitespace-nowrap">
                        {new Date(h.date).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
                      </time>
                    </div>
                    <p className="mt-1.5 text-xs text-surface-600 bg-surface-50 rounded-lg px-3 py-2 border border-surface-200">{h.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── TAB B: Current Diagnosis ────────────────────────────────────────────────────
function DiagnosisTab({ appt, onSave }) {
  const [diagnosis, setDiagnosis] = useState(appt.diagnosis ?? { code: "", label: "", notes: "", severity: "moderate" });
  const [showPresets, setShowPresets] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({ diagnosis });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const SEVERITY_OPTIONS = [
    { val: "low",      label: "Low",      color: "bg-success-100 text-success-700 border-success-300" },
    { val: "moderate", label: "Moderate", color: "bg-warning-100 text-warning-700 border-warning-300" },
    { val: "high",     label: "High",     color: "bg-danger-100  text-danger-700  border-danger-300"  },
    { val: "critical", label: "Critical", color: "bg-danger-200  text-danger-800  border-danger-400"  },
  ];

  return (
    <div className="space-y-5">
      {/* ICD Code + Diagnosis name */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">
            Primary Diagnosis <span className="text-danger-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowPresets((p) => !p)}
            className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
          >
            ICD-10 Presets ▾
          </button>
        </div>

        {/* Preset picker */}
        {showPresets && (
          <div className="mb-3 p-3 bg-surface-50 rounded-xl border border-surface-200 max-h-44 overflow-y-auto space-y-1">
            {DIAGNOSIS_PRESETS.map((p) => (
              <button
                key={p.code}
                type="button"
                onClick={() => { setDiagnosis((d) => ({ ...d, code: p.code, label: p.label })); setShowPresets(false); }}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white hover:border hover:border-primary-200 text-xs transition-colors"
              >
                <span className="px-2 py-0.5 rounded bg-primary-100 text-primary-700 font-mono font-bold text-[10px] shrink-0">{p.code}</span>
                <span className="text-surface-700">{p.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-surface-500 mb-1">ICD Code</label>
            <input className={inputCls} placeholder="e.g. I10"
              value={diagnosis.code}
              onChange={(e) => setDiagnosis((d) => ({ ...d, code: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold text-surface-500 mb-1">Diagnosis Label</label>
            <input className={inputCls} placeholder="Diagnosis description…"
              value={diagnosis.label}
              onChange={(e) => setDiagnosis((d) => ({ ...d, label: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Severity */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-2">Severity</label>
        <div className="flex gap-2 flex-wrap">
          {SEVERITY_OPTIONS.map(({ val, label, color }) => (
            <button
              key={val}
              type="button"
              onClick={() => setDiagnosis((d) => ({ ...d, severity: val }))}
              className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all
                ${diagnosis.severity === val ? color + " shadow-sm" : "bg-white border-surface-200 text-surface-500 hover:border-surface-300"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Clinical Notes */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-1.5">
          Clinical Notes / Findings
        </label>
        <textarea
          className={`${inputCls} resize-none`} rows={4}
          placeholder="Document examination findings, differential diagnosis considerations, clinical reasoning…"
          value={diagnosis.notes}
          onChange={(e) => setDiagnosis((d) => ({ ...d, notes: e.target.value }))}
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
          ${saved
            ? "bg-success-600 text-white"
            : "bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
          }`}
      >
        {saved
          ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
          : <><Save className="w-4 h-4" /> Save Diagnosis</>
        }
      </button>
    </div>
  );
}

// ── TAB C: Treatment Plan / Prescription ────────────────────────────────────────
const EMPTY_RX = { med: "", dosage: "", frequency: "Once daily", duration: "7 days", route: "Oral", notes: "" };

function PrescriptionRow({ rx, index, onChange, onRemove }) {
  return (
    <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600">Rx {index + 1}</span>
        <button onClick={onRemove} className="p-1 rounded-lg hover:bg-danger-50 text-surface-400 hover:text-danger-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-[10px] font-semibold text-surface-500 mb-1">Medication</label>
          <div className="relative">
            <select className={selectCls} value={rx.med}
              onChange={(e) => {
                const med = MEDICATIONS.find((m) => m.name === e.target.value);
                onChange({ ...rx, med: e.target.value, dosage: med?.defaultDosage ?? rx.dosage });
              }}>
              <option value="">— Select medication —</option>
              {MEDICATIONS.map((m) => <option key={m.id}>{m.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-surface-500 mb-1">Dosage</label>
          <input className={inputCls} placeholder="e.g. 500mg"
            value={rx.dosage} onChange={(e) => onChange({ ...rx, dosage: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-surface-500 mb-1">Route</label>
          <div className="relative">
            <select className={selectCls} value={rx.route} onChange={(e) => onChange({ ...rx, route: e.target.value })}>
              {ROUTES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-surface-500 mb-1">Frequency</label>
          <div className="relative">
            <select className={selectCls} value={rx.frequency} onChange={(e) => onChange({ ...rx, frequency: e.target.value })}>
              {DOSAGE_FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-surface-500 mb-1">Duration</label>
          <div className="relative">
            <select className={selectCls} value={rx.duration} onChange={(e) => onChange({ ...rx, duration: e.target.value })}>
              {DOSAGE_DURATIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] font-semibold text-surface-500 mb-1">Instructions / Notes</label>
          <input className={inputCls} placeholder="e.g. Take with food, avoid alcohol…"
            value={rx.notes} onChange={(e) => onChange({ ...rx, notes: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function TreatmentTab({ appt, onSave }) {
  const [prescriptions,   setPrescriptions]   = useState(appt.prescriptions ?? []);
  const [labOrders,       setLabOrders]       = useState(appt.labOrders ?? []);
  const [treatmentNotes,  setTreatmentNotes]  = useState(appt.treatmentNotes ?? "");
  const [saved, setSaved] = useState(false);

  const addRx    = () => setPrescriptions((p) => [...p, { ...EMPTY_RX, id: `rx_${Date.now()}` }]);
  const updateRx = (idx, val) => setPrescriptions((p) => p.map((r, i) => i === idx ? val : r));
  const removeRx = (idx) => setPrescriptions((p) => p.filter((_, i) => i !== idx));

  const toggleLab = (test) => {
    setLabOrders((p) => p.includes(test) ? p.filter((t) => t !== test) : [...p, test]);
  };

  const handleSave = () => {
    onSave({ prescriptions, labOrders, treatmentNotes });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Prescriptions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-surface-500 flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5" /> Prescriptions
            {prescriptions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold">{prescriptions.length}</span>
            )}
          </h3>
          <button
            onClick={addRx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold border border-primary-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Medication
          </button>
        </div>

        {prescriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 bg-surface-50 rounded-xl border border-dashed border-surface-300 text-center">
            <Pill className="w-8 h-8 text-surface-300 mb-2" />
            <p className="text-xs text-surface-400 font-medium">No prescriptions yet</p>
            <p className="text-[11px] text-surface-400">Click "Add Medication" to start</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((rx, i) => (
              <PrescriptionRow
                key={rx.id ?? i} rx={rx} index={i}
                onChange={(val) => updateRx(i, val)}
                onRemove={() => removeRx(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lab Orders */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-surface-500 mb-3 flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5" /> Lab Orders
        </h3>
        <div className="flex flex-wrap gap-2">
          {LAB_PANELS.map((test) => {
            const active = labOrders.includes(test);
            return (
              <button
                key={test}
                type="button"
                onClick={() => toggleLab(test)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all
                  ${active
                    ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                    : "bg-white border-surface-200 text-surface-600 hover:border-violet-300 hover:text-violet-600"
                  }`}
              >
                {active && "✓ "}{test}
              </button>
            );
          })}
        </div>
      </div>

      {/* Treatment Notes */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-surface-500 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Treatment Plan Notes
        </label>
        <textarea
          className={`${inputCls} resize-none`} rows={3}
          placeholder="Follow-up instructions, lifestyle advice, referrals, monitoring plans…"
          value={treatmentNotes}
          onChange={(e) => setTreatmentNotes(e.target.value)}
        />
      </div>

      <button
        onClick={handleSave}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
          ${saved
            ? "bg-success-600 text-white"
            : "bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
          }`}
      >
        {saved
          ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
          : <><Save className="w-4 h-4" /> Save Treatment Plan</>
        }
      </button>
    </div>
  );
}

// ── Main PatientConsultView ─────────────────────────────────────────────────────
const TABS = [
  { id: "history",   label: "Medical History",  icon: History    },
  { id: "diagnosis", label: "Diagnosis",         icon: Stethoscope},
  { id: "treatment", label: "Treatment Plan",    icon: Pill       },
];

export default function PatientConsultView({ appt, onSaveDiagnosis, onSaveTreatment }) {
  const [activeTab, setActiveTab] = useState("history");

  const handleSaveDiagnosis = useCallback(({ diagnosis }) => {
    onSaveDiagnosis({ apptId: appt.id, diagnosis });
  }, [appt.id, onSaveDiagnosis]);

  const handleSaveTreatment = useCallback(({ prescriptions, labOrders, treatmentNotes }) => {
    onSaveTreatment({ apptId: appt.id, prescriptions, labOrders, treatmentNotes });
  }, [appt.id, onSaveTreatment]);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-surface-100 rounded-xl p-1 mb-5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg
              text-xs font-semibold transition-all
              ${activeTab === id
                ? "bg-white text-primary-700 shadow-sm border border-primary-200"
                : "text-surface-500 hover:text-surface-700"
              }
            `}
          >
            <Icon className={`w-3.5 h-3.5 ${activeTab === id ? "text-primary-600" : "text-surface-400"}`} />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "history"   && <MedicalHistoryTab appt={appt} />}
        {activeTab === "diagnosis" && <DiagnosisTab appt={appt} onSave={handleSaveDiagnosis} />}
        {activeTab === "treatment" && <TreatmentTab appt={appt} onSave={handleSaveTreatment} />}
      </div>
    </div>
  );
}