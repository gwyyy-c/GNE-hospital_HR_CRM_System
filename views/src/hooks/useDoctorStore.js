// src/hooks/useDoctorStore.js
// ─────────────────────────────────────────────────────────────────────────────
// Doctor store with real API integration.
// Fetches appointments, medical records, and patient data from PHP backend.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo, useEffect } from "react";
import { pmsAPI, doctorAPI } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

export function useDoctorStore() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract stable primitive values to avoid re-render loops
  const userId = user?.id;
  const userName = user?.name;

  let _notifId = 0;

  // ── Fetch all data and filter by doctor on mount ──────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all appointments, patients, admissions, and medical records
        const [
          appointmentsData,
          patientsData,
          admissionsData,
          medicalRecordsData,
        ] = await Promise.all([
          pmsAPI.getAppointments().catch(() => []),
          pmsAPI.getPatients().catch(() => []),
          pmsAPI.getAdmissions().catch(() => []),
          pmsAPI.getMedicalRecords().catch(() => []),
        ]);

        const allAppointments = Array.isArray(appointmentsData) ? appointmentsData : appointmentsData?.data || [];
        const allPatients = Array.isArray(patientsData) ? patientsData : patientsData?.data || [];
        const allAdmissions = Array.isArray(admissionsData) ? admissionsData : admissionsData?.data || [];
        const allMedicalRecords = Array.isArray(medicalRecordsData) ? medicalRecordsData : medicalRecordsData?.data || [];

        // If user is logged in, filter appointments by doctor_id matching user.id
        const doctorAppointments = userId 
          ? allAppointments.filter(a => 
              String(a.doctor_id) === String(userId) || 
              a.doctor_name?.toLowerCase().includes(userName?.toLowerCase() || "")
            )
          : allAppointments;

        // Get unique patient IDs from doctor's appointments
        const doctorPatientIds = new Set(doctorAppointments.map(a => a.patient_id));
        const doctorPatients = doctorPatientIds.size > 0
          ? allPatients.filter(p => doctorPatientIds.has(p.id) || doctorPatientIds.has(String(p.id)))
          : allPatients;

        // Filter medical records by doctor if user is logged in
        const doctorMedicalRecords = userId
          ? allMedicalRecords.filter(r => String(r.doctor_id) === String(userId))
          : allMedicalRecords;

        // Show all appointments if doctor has none (for demo purposes)
        setAppointments(doctorAppointments.length > 0 ? doctorAppointments : allAppointments.slice(0, 10));
        setPatients(doctorPatients.length > 0 ? doctorPatients : allPatients.slice(0, 10));
        setMedicalRecords(doctorMedicalRecords.length > 0 ? doctorMedicalRecords : allMedicalRecords.slice(0, 10));
      } catch (err) {
        console.error("Failed to fetch doctor data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, userName]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: appointments.length,
      waiting: appointments.filter((a) => a.status === "waiting").length,
      inConsult: appointments.filter((a) => a.status === "in_consult").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      highPriority: appointments.filter(
        (a) => a.priority === "high" && a.status !== "completed"
      ).length,
    }),
    [appointments]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // ── Push a notification ────────────────────────────────────────────────────
  const pushNotification = useCallback((notif) => {
    const id = `n_${++_notifId}_${Date.now()}`;
    setNotifications((prev) => [
      { id, ...notif, timestamp: new Date().toISOString(), read: false },
      ...prev,
    ]);
    return id;
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ── Update appointment status ──────────────────────────────────────────────
  const setStatus = useCallback(async (apptId, status) => {
    try {
      await pmsAPI.updateAppointment(apptId, { status });
      setAppointments((prev) =>
        prev.map((a) => (a.id === apptId ? { ...a, status } : a))
      );
    } catch (err) {
      console.error("Failed to update appointment status:", err);
      throw err;
    }
  }, []);

  // ── Save full clinical record ──────────────────────────────────────────────
  const saveClinicalRecord = useCallback(
    async ({
      apptId,
      patientId,
      diagnosis,
      prescriptions,
      labOrders,
      treatmentNotes,
      careDecision,
    }) => {
      try {
        const recordData = {
          patientId,
          appointmentId: apptId,
          diagnosis,
          prescriptions,
          labOrders,
          treatmentNotes,
          careDecision,
          recordDate: new Date().toISOString(),
        };

        const result = await doctorAPI.createMedicalRecord(recordData);
        const newRecord = result.data || result;

        setMedicalRecords((prev) => [newRecord, ...prev]);
        setAppointments((prev) =>
          prev.map((a) => (a.id === apptId ? { ...a, status: "completed" } : a))
        );

        return newRecord;
      } catch (err) {
        console.error("Failed to save clinical record:", err);
        throw err;
      }
    },
    []
  );

  // ── Set care decision + trigger notification ───────────────────────────────
  const setCareDecision = useCallback(
    async (apptId, decision) => {
      try {
        const appt = appointments.find((a) => a.id === apptId);
        if (!appt) throw new Error("Appointment not found");

        await pmsAPI.updateAppointment(apptId, { careDecision: decision });

        setAppointments((prev) =>
          prev.map((a) =>
            a.id === apptId ? { ...a, careDecision: decision } : a
          )
        );

        // Push notification
        if (decision === "inpatient") {
          pushNotification({
            type: "inpatient_request",
            title: `Inpatient Admission — ${appt.patientName || appt.name}`,
            body: `Please assign a bed for ${appt.patientName || appt.name}.`,
            patientName: appt.patientName || appt.name,
            doctorName: user?.name,
            patientId: appt.patientId,
          });
        } else if (decision === "outpatient") {
          pushNotification({
            type: "discharge_ready",
            title: `Discharge Ready — ${appt.patientName || appt.name}`,
            body: `${appt.patientName || appt.name} has been cleared for discharge.`,
            patientName: appt.patientName || appt.name,
            doctorName: user?.name,
          });
        }

        return decision;
      } catch (err) {
        console.error("Failed to set care decision:", err);
        throw err;
      }
    },
    [user?.name, appointments, pushNotification]
  );

  return {
    // State
    appointments,
    patients,
    medicalRecords,
    notifications,
    stats,
    unreadCount,
    loading,
    error,
    // Mutations
    pushNotification,
    markAllRead,
    dismissNotification,
    setStatus,
    saveClinicalRecord,
    setCareDecision,
  };
}