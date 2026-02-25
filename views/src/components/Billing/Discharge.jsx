// src/components/Billing/Discharge.jsx (exports DischargeModal)
import { useState } from "react";
import {
  X, CheckCircle2, CreditCard, Banknote, Building,
  Smartphone, ShieldCheck, AlertTriangle, BedDouble,
  Stethoscope, User, ArrowRight, Zap, Receipt, LogOut,
} from "lucide-react";
import { PAYMENT_METHODS, INSURANCE_PROVIDERS } from "../../data/Billing";
import { calcInvoiceTotals } from "../../hooks/useBillingStore";

const fmt = (n) => new Intl.NumberFormat("en-US", { style:"currency", currency:"USD" }).format(n);

const METHOD_ICONS = {
  cash:      Banknote,
  card:      CreditCard,
  insurance: Building,
  bank:      Building,
  mobile:    Smartphone,
};

function CascadePreview({ invoice }) {
  const steps = [
    { icon: Receipt,    color: "text-success-600", bg: "bg-success-100", label: "Invoice marked Paid",      sub: `${invoice.id}` },
    { icon: BedDouble,  color: "text-primary-600",  bg: "bg-primary-100",  label: "Bed released → Available", sub: invoice.bedId ?? "N/A" },
    { icon: Stethoscope,color: "text-violet-600",   bg: "bg-violet-100",   label: "Doctor restored → Available", sub: invoice.doctorName },
    { icon: User,       color: "text-warning-600",  bg: "bg-warning-100",  label: "Patient → Discharged",    sub: invoice.patientName },
  ];

  return (
    <div className="rounded-xl border border-surface-200 overflow-hidden">
      <div className="bg-surface-800 px-4 py-2.5 flex items-center gap-2">
        <Zap className="w-3.5 h-3.5 text-yellow-400" />
        <p className="text-xs font-bold text-white">Cascade State Changes</p>
        <span className="ml-auto text-[10px] text-surface-400">All changes are atomic</span>
      </div>
      <div className="divide-y divide-surface-100 bg-surface-50">
        {steps.map(({ icon: Icon, color, bg, label, sub }, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className={`w-3.5 h-3.5 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-surface-800">{label}</p>
              <p className="text-[11px] text-surface-500 truncate">{sub}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-surface-300 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DischargeModal({ invoice, onClose, onConfirm }) {
  const [method,          setMethod]          = useState("");
  const [insProvider,     setInsProvider]     = useState(invoice.insuranceProvider ?? "");
  const [insClaim,        setInsClaim]        = useState(invoice.insuranceClaim ?? "");
  const [partialAmount,   setPartialAmount]   = useState("");
  const [notes,           setNotes]           = useState("");
  const [step,            setStep]            = useState("method"); // "method" | "confirm" | "processing" | "done"
  const [result,          setResult]          = useState(null);

  const totals = calcInvoiceTotals(invoice);

  const handleProceed = () => {
    if (!method) return;
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setStep("processing");
    await new Promise((r) => setTimeout(r, 1400));
    const res = onConfirm({ invoiceId: invoice.id, paymentMethod: method, notes });
    setResult(res);
    setStep("done");
  };

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={step === "done" ? onClose : undefined} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* ── Done / Success state ── */}
        {step === "done" && result && (
          <div className="p-8 text-center">
            <div className="relative mx-auto mb-5 w-20 h-20">
              <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-success-600" />
              </div>
              <span className="absolute -bottom-1 -right-1 text-2xl">🎉</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-surface-900 mb-1">Discharge Complete!</h2>
            <p className="text-surface-500 text-sm mb-6">Payment processed and all resources freed.</p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: Receipt,     label: "Invoice",  value: "Paid",       color: "text-success-700", bg: "bg-success-50", border: "border-success-200" },
                { icon: BedDouble,   label: "Bed",      value: result.bedId, color: "text-primary-700", bg: "bg-primary-50", border: "border-primary-200" },
                { icon: Stethoscope, label: "Doctor",   value: "Available",  color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200"  },
              ].map(({ icon: Icon, label, value, color, bg, border }) => (
                <div key={label} className={`rounded-xl p-3 border text-center ${bg} ${border}`}>
                  <Icon className={`w-5 h-5 mx-auto mb-1.5 ${color}`} />
                  <p className={`text-xs font-bold ${color}`}>{label}</p>
                  <p className={`text-[11px] font-semibold ${color} truncate`}>{value}</p>
                </div>
              ))}
            </div>

            <button onClick={onClose} className="w-full py-3 rounded-xl bg-success-600 hover:bg-success-700 text-white font-semibold transition-colors">
              Done
            </button>
          </div>
        )}

        {/* ── Processing state ── */}
        {step === "processing" && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
              <LogOut className="absolute inset-0 m-auto w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-display text-lg font-bold text-surface-900 mb-1">Processing Discharge</h3>
            <p className="text-sm text-surface-500">Marking payment, freeing bed &amp; updating doctor status…</p>
            <div className="mt-4 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Method selection ── */}
        {(step === "method" || step === "confirm") && (
          <>
            {/* Header */}
            <div
              className="px-6 py-4 border-b border-surface-200 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%)" }}
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-success-600 flex items-center justify-center shadow">
                  <LogOut className="w-5 h-5 text-white" />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold text-surface-900">Process Discharge</h2>
                  <p className="text-xs text-surface-500">{invoice.patientName} · {invoice.id}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 text-surface-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Total due */}
              <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-surface-900">
                <div>
                  <p className="text-xs text-surface-400 font-semibold uppercase tracking-wider">Total Due</p>
                  <p className="font-display text-2xl font-bold text-white">{fmt(totals.grand)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-surface-400">Room: <span className="text-white font-semibold">{fmt(totals.room.total)}</span></p>
                  <p className="text-xs text-surface-400">Treatment: <span className="text-white font-semibold">{fmt(totals.treatment)}</span></p>
                  {totals.discountAmt > 0 && (
                    <p className="text-xs text-success-400">Discount: <span className="font-semibold">−{fmt(totals.discountAmt)}</span></p>
                  )}
                </div>
              </div>

              {/* Payment method */}
              {step === "method" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-2">
                      Payment Method <span className="text-danger-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PAYMENT_METHODS.map((pm) => {
                        const Icon = METHOD_ICONS[pm.id] ?? CreditCard;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setMethod(pm.id)}
                            className={`
                              flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all
                              ${method === pm.id
                                ? "bg-primary-600 border-primary-600 text-white shadow-md"
                                : "bg-white border-surface-200 text-surface-600 hover:border-primary-300"
                              }
                            `}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            {pm.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Insurance fields */}
                  {method === "insurance" && (
                    <div className="space-y-3 p-4 rounded-xl bg-violet-50 border border-violet-200">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-violet-600" />
                        <p className="text-xs font-bold text-violet-700">Insurance Details</p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-violet-600 mb-1 uppercase tracking-wider">Provider</label>
                        <select className={`${inputCls} appearance-none`} value={insProvider}
                          onChange={(e) => setInsProvider(e.target.value)}>
                          <option value="">— Select provider —</option>
                          {INSURANCE_PROVIDERS.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-violet-600 mb-1 uppercase tracking-wider">Claim Number</label>
                        <input className={inputCls} value={insClaim}
                          onChange={(e) => setInsClaim(e.target.value)}
                          placeholder="CLM-2024-XXXXX" />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-1.5">Discharge Notes</label>
                    <textarea className={`${inputCls} resize-none`} rows={2}
                      placeholder="Discharge instructions, follow-up appointment, special notes…"
                      value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>

                  {/* Cascade preview */}
                  <CascadePreview invoice={invoice} />
                </>
              )}

              {/* Confirm step */}
              {step === "confirm" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 px-4 py-3.5 bg-warning-50 border border-warning-300 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-warning-800">Confirm Discharge</p>
                      <p className="text-xs text-warning-700 mt-0.5">
                        This action is irreversible. Payment will be marked as <strong>{method}</strong> and all linked resources will be freed immediately.
                      </p>
                    </div>
                  </div>

                  <CascadePreview invoice={invoice} />

                  <div className="flex justify-between text-sm px-1">
                    <span className="text-surface-500">Amount Being Processed</span>
                    <span className="font-display text-xl font-bold text-surface-900">{fmt(totals.grand)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-surface-200 bg-surface-50 flex gap-3">
              {step === "method" && (
                <>
                  <button onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-100 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleProceed} disabled={!method}
                    className="flex-1 py-2.5 rounded-xl bg-success-600 hover:bg-success-700 text-white text-sm font-bold shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    Review &amp; Confirm →
                  </button>
                </>
              )}
              {step === "confirm" && (
                <>
                  <button onClick={() => setStep("method")}
                    className="flex-1 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-100 transition-colors">
                    ← Back
                  </button>
                  <button onClick={handleConfirm}
                    className="flex-1 py-2.5 rounded-xl bg-success-600 hover:bg-success-700 text-white text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Mark as Paid &amp; Discharge
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}