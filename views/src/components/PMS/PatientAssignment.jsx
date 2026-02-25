import { useState } from "react";
import {
  X, UserCheck, BedDouble, Stethoscope, CheckCircle2,
  AlertCircle, ArrowRight, User, Clock, Activity,
} from "lucide-react";
import { DOCTOR_STATUS_STYLES, BED_STATUS_STYLES } from "../../data/pmsData";

function SummaryRow({ icon: Icon, label, value, sub, color = "text-surface-600" }) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-surface-50 rounded-xl border border-surface-200">
      <span className="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center shrink-0 shadow-sm">
        <Icon className={`w-4 h-4 ${color}`} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">{label}</p>
        <p className="text-sm font-semibold text-surface-900 truncate">{value}</p>
        {sub && <p className="text-xs text-surface-500">{sub}</p>}
      </div>
    </div>
  );
}

export default function PatientAssignment({
  patients,
  doctors,
  beds,
  onClose,
  onAssign,
  preselectedPatientId = null,
  preselectedDoctorId  = null,
  preselectedBedId     = null,
}) {
  const [patientId, setPatientId] = useState(preselectedPatientId ?? "");
  const [doctorId,  setDoctorId]  = useState(preselectedDoctorId  ?? "");
  const [bedId,     setBedId]     = useState(preselectedBedId     ?? "");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [result,    setResult]    = useState(null);

  // Derived selections
  const selectedPatient = patients.find((p) => p.id === patientId);
  const selectedDoctor  = doctors.find((d)  => d.id === doctorId);
  const selectedBed     = beds.find((b)     => b.id === bedId);

  // Filter options
  const waitingPatients  = patients.filter((p) => p.status === "Waiting");
  const availDoctors     = doctors.filter((d)  => d.status === "Available" && d.currentShift);
  const emptyBeds        = beds.filter((b)     => b.status === "empty");

  const canAssign = patientId && doctorId && bedId && !done;

  const handleAssign = async () => {
    if (!canAssign) return;
    setLoading(true);
    setError("");
    try {
      await new Promise((r) => setTimeout(r, 800));
      const res = onAssign({ patientId, doctorId, bedId });
      setResult(res);
      setDone(true);
    } catch (err) {
      setError(err.message ?? "Assignment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectCls = `
    w-full px-3.5 py-2.5 rounded-xl text-sm text-surface-800 bg-white border border-surface-200
    focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
    transition-colors shadow-sm appearance-none
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={!done ? onClose : undefined} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 border-b border-surface-200 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)" }}
        >
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow">
              <UserCheck className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-surface-900">Assign Patient</h2>
              <p className="text-xs text-surface-500">Link patient → doctor → bed</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/80 text-surface-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {done ? (
            /* ── Success State ── */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success-600" />
              </div>
              <h3 className="font-display text-xl font-bold text-surface-900 mb-1">Assignment Complete</h3>
              <p className="text-sm text-surface-500 mb-6">Patient has been successfully admitted.</p>

              <div className="space-y-2 text-left mb-6">
                <SummaryRow icon={User}       label="Patient"  value={selectedPatient?.name}   sub={selectedPatient?.reason}      color="text-primary-600" />
                <div className="flex justify-center py-0.5"><ArrowRight className="w-4 h-4 text-surface-300" /></div>
                <SummaryRow icon={Stethoscope}label="Doctor"   value={selectedDoctor?.name}    sub={selectedDoctor?.specialization} color="text-success-600" />
                <div className="flex justify-center py-0.5"><ArrowRight className="w-4 h-4 text-surface-300" /></div>
                <SummaryRow icon={BedDouble}  label="Bed"      value={selectedBed?.id}         sub={selectedBed?.wardName}         color="text-warning-600" />
              </div>

              <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-success-600 hover:bg-success-700 text-white text-sm font-semibold transition-colors">
                Done
              </button>
            </div>
          ) : (
            /* ── Assignment Form ── */
            <>
              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-danger-50 border border-danger-200 rounded-xl text-danger-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Patient selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Patient
                  <span className="text-danger-500">*</span>
                </label>
                <select
                  className={selectCls}
                  value={patientId}
                  onChange={(e) => { setPatientId(e.target.value); setError(""); }}
                >
                  <option value="">— Select waiting patient —</option>
                  {waitingPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.age}y · {p.visitType}
                    </option>
                  ))}
                </select>
                {waitingPatients.length === 0 && (
                  <p className="mt-1 text-xs text-surface-400">No patients in the waiting queue.</p>
                )}
                {selectedPatient && (
                  <div className="mt-2 px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-xs text-primary-700">
                    <span className="font-semibold">Reason: </span>{selectedPatient.reason}
                  </div>
                )}
              </div>

              {/* Doctor selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-1.5 flex items-center gap-1.5">
                  <Stethoscope className="w-3 h-3" /> Doctor
                  <span className="text-danger-500">*</span>
                  <span className="text-[10px] text-success-600 font-normal normal-case ml-auto">
                    {availDoctors.length} available
                  </span>
                </label>
                <select
                  className={selectCls}
                  value={doctorId}
                  onChange={(e) => { setDoctorId(e.target.value); setError(""); }}
                >
                  <option value="">— Select available doctor —</option>
                  {availDoctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {d.specialization} · {d.patientCount} pts
                    </option>
                  ))}
                </select>
                {availDoctors.length === 0 && (
                  <p className="mt-1 text-xs text-danger-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />No available doctors on current shift.
                  </p>
                )}
                {selectedDoctor && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-success-50 border border-success-200 rounded-lg">
                    <Activity className="w-3.5 h-3.5 text-success-600 shrink-0" />
                    <p className="text-xs text-success-700">
                      Shift: <span className="font-semibold">{selectedDoctor.shiftStart}–{selectedDoctor.shiftEnd}</span>
                      {" · "}Currently handling <span className="font-semibold">{selectedDoctor.patientCount}</span> patients
                    </p>
                  </div>
                )}
              </div>

              {/* Bed selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-1.5 flex items-center gap-1.5">
                  <BedDouble className="w-3 h-3" /> Bed
                  <span className="text-danger-500">*</span>
                  <span className="text-[10px] text-success-600 font-normal normal-case ml-auto">
                    {emptyBeds.length} available
                  </span>
                </label>
                <select
                  className={selectCls}
                  value={bedId}
                  onChange={(e) => { setBedId(e.target.value); setError(""); }}
                >
                  <option value="">— Select available bed —</option>
                  {/* Group by ward */}
                  {WARDS_ORDER.map((wardName) => {
                    const wardBeds = emptyBeds.filter((b) => b.wardName === wardName);
                    if (wardBeds.length === 0) return null;
                    return (
                      <optgroup key={wardName} label={wardName}>
                        {wardBeds.map((b) => (
                          <option key={b.id} value={b.id}>{b.id} — {b.wardName}</option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                {selectedBed && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-warning-50 border border-warning-200 rounded-lg">
                    <BedDouble className="w-3.5 h-3.5 text-warning-600 shrink-0" />
                    <p className="text-xs text-warning-700 font-semibold">
                      {selectedBed.id} · {selectedBed.wardName}
                    </p>
                  </div>
                )}
              </div>

              {/* Connection preview */}
              {selectedPatient && selectedDoctor && selectedBed && (
                <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-3">Assignment Preview</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-6 h-6 rounded bg-primary-100 flex items-center justify-center shrink-0">
                      <User className="w-3 h-3 text-primary-600" />
                    </span>
                    <span className="font-semibold text-surface-800">{selectedPatient.name}</span>
                    <ArrowRight className="w-3 h-3 text-surface-400" />
                    <span className="w-6 h-6 rounded bg-success-100 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-3 h-3 text-success-600" />
                    </span>
                    <span className="font-semibold text-surface-800">{selectedDoctor.name}</span>
                    <ArrowRight className="w-3 h-3 text-surface-400" />
                    <span className="w-6 h-6 rounded bg-warning-100 flex items-center justify-center shrink-0">
                      <BedDouble className="w-3 h-3 text-warning-600" />
                    </span>
                    <span className="font-semibold text-surface-800">{selectedBed.id}</span>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleAssign}
                disabled={!canAssign || loading}
                className="
                  w-full flex items-center justify-center gap-2.5 py-3 rounded-xl
                  bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm
                  shadow-md shadow-primary-200 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                "
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Assigning…
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Confirm Assignment
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Ward order for optgroup display
const WARDS_ORDER = [
  "General Ward", "ICU", "Pediatrics", "Maternity", "Surgical", "Cardiology",
];