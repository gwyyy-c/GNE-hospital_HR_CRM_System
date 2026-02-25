// src/components/Doctor/CareDecisionToggle.jsx
import { useState } from "react";
import { Home, Building2, Bell, CheckCircle2, AlertTriangle } from "lucide-react";

export default function CareDecisionToggle({ current, patientName, onDecide, disabled }) {
  const [confirming,  setConfirming]  = useState(null); // "outpatient" | "inpatient" | null
  const [justChanged, setJustChanged] = useState(null);

  const handleClick = (decision) => {
    if (current === decision || disabled) return;
    setConfirming(decision);
  };

  const handleConfirm = () => {
    if (!confirming) return;
    onDecide(confirming);
    setJustChanged(confirming);
    setConfirming(null);
    setTimeout(() => setJustChanged(null), 3000);
  };

  const handleCancel = () => setConfirming(null);

  return (
    <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden shadow-card">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-surface-200 bg-surface-50 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
          <Building2 className="w-3.5 h-3.5 text-primary-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-surface-900">Care Decision</p>
          <p className="text-[11px] text-surface-500">Determines admission path for this patient</p>
        </div>
      </div>

      <div className="p-5">
        {/* Toggle options */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* OUTPATIENT */}
          <button
            type="button"
            onClick={() => handleClick("outpatient")}
            disabled={disabled}
            className={`
              relative flex flex-col items-center gap-2 p-4 rounded-xl border-2
              transition-all duration-150 text-center
              ${current === "outpatient"
                ? "bg-success-50 border-success-400 shadow-md shadow-success-100"
                : "bg-white border-surface-200 hover:border-success-300 hover:bg-success-50/50"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {current === "outpatient" && (
              <span className="absolute top-2 right-2">
                <CheckCircle2 className="w-4 h-4 text-success-600" />
              </span>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl
              ${current === "outpatient" ? "bg-success-100" : "bg-surface-100"}`}>
              🏠
            </div>
            <div>
              <p className={`text-sm font-bold ${current === "outpatient" ? "text-success-800" : "text-surface-700"}`}>
                Outpatient
              </p>
              <p className={`text-[11px] ${current === "outpatient" ? "text-success-600" : "text-surface-500"}`}>
                Discharge / Follow-up
              </p>
            </div>
          </button>

          {/* INPATIENT */}
          <button
            type="button"
            onClick={() => handleClick("inpatient")}
            disabled={disabled}
            className={`
              relative flex flex-col items-center gap-2 p-4 rounded-xl border-2
              transition-all duration-150 text-center
              ${current === "inpatient"
                ? "bg-danger-50 border-danger-400 shadow-md shadow-danger-100"
                : "bg-white border-surface-200 hover:border-danger-300 hover:bg-danger-50/50"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {current === "inpatient" && (
              <span className="absolute top-2 right-2">
                <CheckCircle2 className="w-4 h-4 text-danger-600" />
              </span>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl
              ${current === "inpatient" ? "bg-danger-100" : "bg-surface-100"}`}>
              🏥
            </div>
            <div>
              <p className={`text-sm font-bold ${current === "inpatient" ? "text-danger-800" : "text-surface-700"}`}>
                Inpatient
              </p>
              <p className={`text-[11px] ${current === "inpatient" ? "text-danger-600" : "text-surface-500"}`}>
                Admit · Bed Required
              </p>
            </div>
          </button>
        </div>

        {/* Confirmation dialog */}
        {confirming && (
          <div className={`rounded-xl border p-4 mb-3
            ${confirming === "inpatient"
              ? "bg-danger-50 border-danger-300"
              : "bg-success-50 border-success-300"}`}
          >
            <div className="flex items-start gap-2.5 mb-3">
              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0
                ${confirming === "inpatient" ? "text-danger-600" : "text-success-600"}`} />
              <div>
                <p className={`text-sm font-semibold
                  ${confirming === "inpatient" ? "text-danger-800" : "text-success-800"}`}>
                  Confirm {confirming === "inpatient" ? "Inpatient Admission" : "Outpatient Discharge"}
                </p>
                <p className={`text-xs mt-0.5
                  ${confirming === "inpatient" ? "text-danger-700" : "text-success-700"}`}>
                  {confirming === "inpatient"
                    ? `${patientName} will be flagged for bed assignment. Front Desk will be notified immediately.`
                    : `${patientName} will be cleared for discharge with take-home prescriptions.`
                  }
                </p>
              </div>
            </div>
            {confirming === "inpatient" && (
              <div className="flex items-center gap-2 text-[11px] text-danger-600 mb-3">
                <Bell className="w-3.5 h-3.5" />
                A real-time notification will be sent to the Front Desk queue.
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                className={`flex-1 py-2 rounded-xl text-xs font-bold text-white transition-colors
                  ${confirming === "inpatient"
                    ? "bg-danger-600 hover:bg-danger-700"
                    : "bg-success-600 hover:bg-success-700"}`}
              >
                Confirm
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-surface-600 bg-white border border-surface-200 hover:bg-surface-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Success toast */}
        {justChanged && (
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold
            ${justChanged === "inpatient"
              ? "bg-danger-50 text-danger-700 border border-danger-200"
              : "bg-success-50 text-success-700 border border-success-200"}`}
          >
            {justChanged === "inpatient" ? (
              <><Bell className="w-3.5 h-3.5 shrink-0" />Front Desk notified — bed assignment pending</>
            ) : (
              <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" />Patient cleared for discharge</>
            )}
          </div>
        )}

        {/* Current state label */}
        {!confirming && !justChanged && current && (
          <div className={`text-center text-xs font-medium py-1.5 rounded-lg
            ${current === "inpatient" ? "text-danger-600 bg-danger-50" : "text-success-600 bg-success-50"}`}>
            Currently set to: <strong>{current === "inpatient" ? "Inpatient" : "Outpatient"}</strong>
          </div>
        )}

        {!current && !confirming && (
          <p className="text-center text-xs text-surface-400">
            No decision recorded yet — select above to assign a care path.
          </p>
        )}
      </div>
    </div>
  );
}