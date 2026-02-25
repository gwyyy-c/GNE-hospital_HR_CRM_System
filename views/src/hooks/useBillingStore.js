/**
 * useBillingStore - Billing state management hook
 * Handles invoices, payments, and discharge workflow.
 */
import { useState, useCallback, useMemo } from "react";
import { INITIAL_INVOICES, WARD_RATES, TAX_RATE } from "../data/Billing";

let _invoiceCounter = 100;

/** Calculate room charge based on admission duration and ward rate */
export function calcRoomCharge(admittedAt, wardCode, dischargedAt = null) {
  if (!admittedAt || !wardCode) return { days: 0, rate: 0, total: 0 };
  const rate = WARD_RATES[wardCode]?.ratePerDay ?? 180;
  const checkOut = dischargedAt ? new Date(dischargedAt) : new Date();
  const checkIn = new Date(admittedAt);
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.max(1, Math.ceil((checkOut - checkIn) / msPerDay));
  return { days, rate, total: days * rate };
}

/** Calculate full invoice breakdown (room, treatment, tax, grand total) */
export function calcInvoiceTotals(invoice) {
  const room = calcRoomCharge(invoice.admittedAt, invoice.wardCode, invoice.dischargedAt);
  const treatment = invoice.lineItems.reduce((sum, li) => sum + li.amount, 0);
  const subtotal = treatment + room.total;
  const discountAmt = Math.round((subtotal * (invoice.discount ?? 0)) / 100);
  const taxable = subtotal - discountAmt;
  const tax = Math.round(taxable * TAX_RATE);
  const grand = taxable + tax;
  return { room, treatment, subtotal, discountAmt, tax, grand };
}

export function useBillingStore() {
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);

  /** Derived billing statistics */
  const stats = useMemo(() => {
    const pending = invoices.filter((i) => i.status === "pending");
    const paid = invoices.filter((i) => i.status === "paid");
    const pendingTotal = pending.reduce((s, i) => s + calcInvoiceTotals(i).grand, 0);
    const paidTotal = paid.reduce((s, i) => s + calcInvoiceTotals(i).grand, 0);
    return {
      totalInvoices: invoices.length,
      pendingCount: pending.length,
      paidCount: paid.length,
      pendingRevenue: pendingTotal,
      collectedRevenue: paidTotal,
      todayRevenue: paid
        .filter((i) => i.paidAt && new Date(i.paidAt).toDateString() === new Date().toDateString())
        .reduce((s, i) => s + calcInvoiceTotals(i).grand, 0),
    };
  }, [invoices]);

  /** Add a charge line item to an invoice */
  const addLineItem = useCallback((invoiceId, item) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, lineItems: [...inv.lineItems, { id: `li_${Date.now()}`, ...item }] }
          : inv
      )
    );
  }, []);

  /** Remove a charge line item from an invoice */
  const removeLineItem = useCallback((invoiceId, itemId) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, lineItems: inv.lineItems.filter((li) => li.id !== itemId) }
          : inv
      )
    );
  }, []);

  /** Update invoice discount percentage */
  const setDiscount = useCallback((invoiceId, pct) => {
    setInvoices((prev) =>
      prev.map((inv) => inv.id === invoiceId ? { ...inv, discount: pct } : inv)
    );
  }, []);

  /** Update insurance provider and claim number */
  const setInsurance = useCallback((invoiceId, provider, claimNo) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, insuranceProvider: provider, insuranceClaim: claimNo }
          : inv
      )
    );
  }, []);

  /** Create a new invoice for a patient */
  const createInvoice = useCallback((data) => {
    const id = `inv-${String(++_invoiceCounter).padStart(3, "0")}`;
    const newInvoice = {
      id,
      status: "pending",
      paymentMethod: null,
      paidAt: null,
      lineItems: [],
      discount: 0,
      ...data,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    return id;
  }, []);

  /**
   * Process patient discharge with cascade state changes:
   * - Mark invoice as Paid
   * - Free assigned bed
   * - Restore doctor availability
   * - Mark patient as Discharged
   * - Send discharge notification
   */
  const processDischarge = useCallback(({
    invoiceId,
    paymentMethod,
    onFreeBed,
    onFreeDoctor,
    onDischargePatient,
    onPushNotification,
  }) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) throw new Error(`Invoice ${invoiceId} not found.`);
    if (invoice.status === "paid") throw new Error("Invoice already marked as paid.");

    const now = new Date().toISOString();

    // 1. Mark invoice as paid
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, status: "paid", paymentMethod, paidAt: now, dischargedAt: now }
          : inv
      )
    );

    // 2. Free the bed → status: "empty"
    if (invoice.bedId && onFreeBed) {
      onFreeBed(invoice.bedId);
    }

    // 3. Restore doctor availability
    if (invoice.doctorId && onFreeDoctor) {
      onFreeDoctor(invoice.doctorId);
    }

    // 4. Mark patient as discharged
    if (invoice.patientId && onDischargePatient) {
      onDischargePatient(invoice.patientId);
    }

    // 5. Push discharge notification
    if (onPushNotification) {
      onPushNotification({
        type:  "discharge_complete",
        title: `Discharge Complete — ${invoice.patientName}`,
        body:  `${invoice.patientName} has been discharged. Bed ${invoice.bedId} is now available. ${invoice.doctorName} is available for next patient.`,
        patientName: invoice.patientName,
        bedId:       invoice.bedId,
        doctorName:  invoice.doctorName,
      });
    }

    return {
      patientName: invoice.patientName,
      bedId: invoice.bedId,
      doctorName: invoice.doctorName,
    };
  }, [invoices]);

  /** Mark invoice as waived with reason */
  const waiveInvoice = useCallback((invoiceId, reason) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, status: "waived", notes: (inv.notes ?? "") + `\nWaived: ${reason}` }
          : inv
      )
    );
  }, []);

  /** Toggle invoice status between Pending and Paid */
  const toggleInvoiceStatus = useCallback((invoiceId) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const newStatus = inv.status === "pending" ? "paid" : "pending";
        return {
          ...inv,
          status: newStatus,
          paidAt: newStatus === "paid" ? new Date().toISOString() : null,
          paymentMethod: newStatus === "paid" ? "cash" : null,
        };
      })
    );
  }, []);

  return {
    invoices, stats,
    addLineItem, removeLineItem, setDiscount, setInsurance,
    createInvoice, processDischarge, waiveInvoice, toggleInvoiceStatus,
  };
}