/**
 * BillingSummary.jsx
 * Billing dashboard with revenue KPIs, invoice list, and discharge workflow.
 */
import { useState, useMemo } from "react";
import {
  DollarSign, Receipt, Clock, CheckCircle2, TrendingUp,
  Search, Filter, LogOut, Eye, CreditCard, SlidersHorizontal,
  Tag, ChevronRight, BedDouble, Stethoscope, Bell,
  ArrowUpRight, X,
} from "lucide-react";
import { useBillingStore, calcInvoiceTotals }  from "../../hooks/useBillingStore";
import { INVOICE_STATUS_STYLES }               from "../../data/Billing";
import DischargeModal                          from "./Discharge";

const fmt    = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const fmtShort = (n) => n >= 1000 ? `$${(n/1000).toFixed(1)}k` : fmt(n);

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, gradient, trend }) {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-surface-200 shadow-card p-5">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(135deg, ${gradient}33 0%, transparent 60%)`,
        }}
      />
      <div className="flex items-start justify-between mb-3">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: `${gradient}18` }}
        >
          <Icon className="w-5 h-5" style={{ color: gradient }} />
        </span>
        {trend !== undefined && (
          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-success-600">
            <ArrowUpRight className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <p className="font-display text-2xl font-bold text-surface-900">{value}</p>
      <p className="text-xs text-surface-500 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-surface-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Invoice row ────────────────────────────────────────────────────────────────
function InvoiceRow({ invoice, selected, onSelect, onDischarge }) {
  const totals = calcInvoiceTotals(invoice);
  const status = INVOICE_STATUS_STYLES[invoice.status] ?? INVOICE_STATUS_STYLES.pending;
  const isPending = invoice.status === "pending";

  return (
    <div
      onClick={() => onSelect(invoice)}
      className={`
        group flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all
        ${selected
          ? "border-primary-400 bg-primary-50 shadow-md shadow-primary-100"
          : "border-transparent hover:border-surface-200 hover:bg-surface-50"
        }
      `}
    >
      {/* Patient avatar */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
        {invoice.patientName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-surface-900 truncate">{invoice.patientName}</p>
          {invoice.wardCode && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
              {invoice.bedId}
            </span>
          )}
        </div>
        <p className="text-xs text-surface-500 truncate">{invoice.doctorName}</p>
      </div>

      {/* Status */}
      <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${status.bg} ${status.text} ${status.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
        {status.label}
      </span>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className="font-display text-sm font-bold text-surface-900">{fmtShort(totals.grand)}</p>
        <p className="text-[10px] text-surface-400">{invoice.id}</p>
      </div>

      {/* Action */}
      {isPending ? (
        <button
          onClick={(e) => { e.stopPropagation(); onDischarge(invoice); }}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success-600 hover:bg-success-700 text-white text-[11px] font-bold transition-colors shadow-sm"
        >
          <LogOut className="w-3 h-3" /> Pay &amp; Discharge
        </button>
      ) : (
        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selected ? "text-primary-500 translate-x-0.5" : "text-surface-300 group-hover:text-surface-400"}`} />
      )}
    </div>
  );
}

// ── Billing Summary Card (charge breakdown for a single invoice) ───────────────
function BillingSummaryCard({ invoice, onAddLineItem, onRemoveLineItem }) {
  const totals = calcInvoiceTotals(invoice);
  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-lg font-bold text-surface-900">{invoice.patientName}</p>
          <p className="text-xs text-surface-500">{invoice.id} · {invoice.doctorName}</p>
        </div>
        {invoice.bedId && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 text-primary-700">
            {invoice.bedId}
          </span>
        )}
      </div>

      {/* Line items */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-surface-400">Charges</p>
        {invoice.lineItems.map((li) => (
          <div key={li.id} className="flex items-center justify-between py-1.5 border-b border-surface-100 last:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-surface-700 truncate">{li.label}</p>
              <p className="text-[10px] text-surface-400">Qty: {li.qty} × {fmt(li.unitRate)}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-surface-900">{fmt(li.amount)}</p>
              {onRemoveLineItem && (
                <button
                  onClick={() => onRemoveLineItem(invoice.id, li.id)}
                  className="text-danger-400 hover:text-danger-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Room charge */}
      {totals.room.total > 0 && (
        <div className="flex justify-between text-sm border-t border-surface-100 pt-3">
          <span className="text-surface-500">Room ({totals.room.days} day{totals.room.days > 1 ? "s" : ""} × {fmt(totals.room.rate)})</span>
          <span className="font-semibold text-surface-900">{fmt(totals.room.total)}</span>
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-surface-200 pt-3 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-surface-500">Subtotal</span>
          <span className="font-medium">{fmt(totals.subtotal)}</span>
        </div>
        {totals.discountAmt > 0 && (
          <div className="flex justify-between text-sm text-success-600">
            <span>Discount ({invoice.discount}%)</span>
            <span>-{fmt(totals.discountAmt)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-surface-500">Tax</span>
          <span className="font-medium">{fmt(totals.tax)}</span>
        </div>
        <div className="flex justify-between text-base font-bold pt-2 border-t border-surface-200">
          <span>Total Due</span>
          <span className="text-primary-600">{fmt(totals.grand)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Cascade notification toast ─────────────────────────────────────────────────
function CascadeToast({ result, onDismiss }) {
  if (!result) return null;
  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full animate-in slide-in-from-bottom-4">
      <div className="bg-surface-900 rounded-2xl shadow-2xl border border-surface-700 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-700">
          <CheckCircle2 className="w-4 h-4 text-success-400" />
          <p className="text-sm font-bold text-white">Discharge Cascade Complete</p>
          <button onClick={onDismiss} className="ml-auto text-surface-500 hover:text-surface-300">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 py-3 space-y-2">
          {[
            { icon: BedDouble,   text: `Bed ${result.bedId} is now`, status: "Available", c: "text-success-400" },
            { icon: Stethoscope, text: result.doctorName, status: "Available", c: "text-violet-400" },
            { icon: Receipt,     text: "Invoice", status: "Marked Paid", c: "text-success-400" },
          ].map(({ icon: Icon, text, status, c }, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Icon className="w-3.5 h-3.5 text-surface-500 shrink-0" />
              <span className="text-xs text-surface-400">{text}</span>
              <span className={`ml-auto text-xs font-bold ${c}`}>→ {status}</span>
            </div>
          ))}
    </div>
  );
}

/** Main Billing Dashboard */
export default function BillingDashboard() {
  const {
    invoices, stats,
    addLineItem, removeLineItem, setDiscount,
    processDischarge,
  } = useBillingStore();

  // Cascade handlers - in production, these would be from shared context
  const onFreeBed = (bedId) => console.log(`[CASCADE] Bed ${bedId} → empty`);
  const onFreeDoctor = (doctorId) => console.log(`[CASCADE] Doctor ${doctorId} → Available`);
  const onDischargePatient = (patientId) => console.log(`[CASCADE] Patient ${patientId} → Discharged`);
  const onPushNotification = (notif) => console.log(`[NOTIF] ${notif.title}`);

  const [selectedInvoice, setSelectedInvoice] = useState(invoices[0] ?? null);
  const [dischargeTarget, setDischargeTarget] = useState(null);
  const [cascadeResult, setCascadeResult] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [discountInput, setDiscountInput] = useState("");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  /** Filter invoices by status and search term */
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;
      const matchSearch = inv.patientName.toLowerCase().includes(search.toLowerCase()) ||
                          inv.id.toLowerCase().includes(search.toLowerCase()) ||
                          inv.doctorName.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [invoices, search, statusFilter]);

  /** Handle discharge with cascade state updates */
  const handleDischargeConfirm = ({ invoiceId, paymentMethod, notes }) => {
    const result = processDischarge({
      invoiceId,
      paymentMethod,
      onFreeBed,
      onFreeDoctor,
      onDischargePatient,
      onPushNotification,
    });
    setCascadeResult(result);
    setDischargeTarget(null);
    // Update selected invoice view
    const updated = invoices.find((i) => i.id === invoiceId);
    if (updated) setSelectedInvoice({ ...updated, status: "paid" });
    setTimeout(() => setCascadeResult(null), 8000);
    return result;
  };

  return (
    <div className="space-y-6">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5" /> {today}
          </p>
          <h1 className="font-display text-2xl font-bold text-surface-900">Billing &amp; Discharge</h1>
          <p className="text-sm text-surface-500 mt-1">
            Manage patient invoices, process payments, and handle bed releases.
          </p>
        </div>
      </div>

      {/* ── KPI row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Pending Invoices"  value={stats.pendingCount}           icon={Clock}        gradient="#f59e0b" sub={`${fmtShort(stats.pendingRevenue)} outstanding`} />
        <KpiCard label="Collected Today"   value={fmtShort(stats.todayRevenue)} icon={DollarSign}   gradient="#16a34a" trend="+12%" />
        <KpiCard label="Paid Invoices"     value={stats.paidCount}              icon={CheckCircle2} gradient="#2563eb" sub="This month" />
        <KpiCard label="Total Revenue"     value={fmtShort(stats.collectedRevenue)} icon={TrendingUp} gradient="#9333ea" trend="+8.4%" />
      </div>

      {/* ── Main 2-column layout ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* LEFT: Invoice list */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
            {/* Toolbar */}
            <div className="px-4 py-3.5 border-b border-surface-200 space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search patient, invoice…"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-surface-200 bg-surface-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>

              {/* Status filter pills */}
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { val: "all",     label: "All" },
                  { val: "pending", label: "Pending" },
                  { val: "paid",    label: "Paid" },
                  { val: "waived",  label: "Waived" },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setStatusFilter(val)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === val ? "bg-primary-600 text-white" : "bg-surface-100 text-surface-600 hover:bg-surface-200"}`}
                  >
                    {label}
                    {val !== "all" && (
                      <span className={`ml-1.5 text-[10px] ${statusFilter === val ? "text-primary-200" : "text-surface-400"}`}>
                        {invoices.filter((i) => i.status === val).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="p-3 space-y-1 max-h-[540px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <Receipt className="w-8 h-8 text-surface-300 mx-auto mb-2" />
                  <p className="text-sm text-surface-400">No invoices found</p>
                </div>
              ) : (
                filtered.map((inv) => (
                  <InvoiceRow
                    key={inv.id}
                    invoice={inv}
                    selected={selectedInvoice?.id === inv.id}
                    onSelect={setSelectedInvoice}
                    onDischarge={setDischargeTarget}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Detail view */}
        <div className="xl:col-span-3 space-y-4">
          {selectedInvoice ? (
            <>
              {/* Charge card */}
              <BillingSummaryCard
                invoice={selectedInvoice}
                onAddLineItem={selectedInvoice.status === "pending" ? addLineItem : null}
                onRemoveLineItem={selectedInvoice.status === "pending" ? removeLineItem : null}
                onSetDiscount={selectedInvoice.status === "pending" ? setDiscount : null}
              />

              {/* Discount control */}
              {selectedInvoice.status === "pending" && (
                <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-surface-900">Discount</p>
                      <p className="text-xs text-surface-500">Applied to subtotal before tax</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[0, 5, 10, 15, 20, 25].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setDiscount(selectedInvoice.id, pct)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                          selectedInvoice.discount === pct
                            ? "bg-success-600 border-success-600 text-white shadow-sm"
                            : "bg-white border-surface-200 text-surface-600 hover:border-success-300"
                        }`}
                      >
                        {pct === 0 ? "None" : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action bar */}
              {selectedInvoice.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setDischargeTarget(selectedInvoice)}
                    className="
                      flex-1 flex items-center justify-center gap-2.5
                      py-4 rounded-2xl bg-success-600 hover:bg-success-700
                      text-white font-bold text-base shadow-lg shadow-success-200
                      transition-all hover:shadow-xl hover:shadow-success-200 hover:-translate-y-0.5
                    "
                  >
                    <LogOut className="w-5 h-5" />
                    Mark as Paid &amp; Discharge
                  </button>
                </div>
              )}

              {/* Already paid state */}
              {selectedInvoice.status === "paid" && (
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-success-50 border border-success-200">
                  <CheckCircle2 className="w-6 h-6 text-success-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-success-800">Invoice Settled</p>
                    <p className="text-xs text-success-600">
                      All resources have been freed. Bed and doctor are available.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-surface-200 shadow-card text-center">
              <Receipt className="w-10 h-10 text-surface-200 mb-3" />
              <p className="text-sm font-medium text-surface-500">Select an invoice</p>
              <p className="text-xs text-surface-400">Choose a patient from the list to view billing details</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Discharge Modal ────────────────────────────────────────────────── */}
      {dischargeTarget && (
        <DischargeModal
          invoice={dischargeTarget}
          onClose={() => setDischargeTarget(null)}
          onConfirm={handleDischargeConfirm}
        />
      )}

      {/* ── Cascade toast ──────────────────────────────────────────────────── */}
      <CascadeToast
        result={cascadeResult}
        onDismiss={() => setCascadeResult(null)}
      />
    </div>
  );
}