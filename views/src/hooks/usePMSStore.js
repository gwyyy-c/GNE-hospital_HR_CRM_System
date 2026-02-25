/**
 * usePMSStore Hook
 * =================
 * 
 * Custom React hook that serves as the data store (Controller in MVC) for 
 * the Patient Management System. Fetches data from the backend API and 
 * provides CRUD operations for patients, appointments, admissions, and beds.
 * 
 * Exported state:
 *   - patients, appointments, admissions, beds, doctors
 *   - loading, error
 * 
 * Exported mutations:
 *   - registerPatient, assignPatient, dischargePatient
 *   - bookAppointment, updateBedStatus
 * 
 * @package   hr-pms-frontend
 * @category  Hook (Controller in MVC)
 */
import { useState, useCallback, useMemo, useEffect } from "react";
import { pmsAPI, departmentAPI } from "../services/apiClient";

/**
 * Map raw employee/doctor API response to shape expected by PMS components
 * Normalizes field names and converts status values for UI display
 */
function mapDoctor(emp) {
  const name = emp.full_name ?? emp.name ?? "Unknown";

  // DB status is "Active" (from WHERE filter); map to UI "Available"
  const rawStatus    = emp.availability ?? emp.status ?? "";
  const uiStatus     = rawStatus === "Active" ? "Available" : (rawStatus || "Off Shift");
  const currentShift = uiStatus === "Available";

  return {
    id:             String(emp.employee_id ?? emp.id ?? Math.random()),
    name,
    specialization: emp.specialization ?? emp.position ?? emp.department ?? emp.dept_name ?? "General",
    status:         uiStatus,
    currentShift,
    shiftStart:     emp.shift_start  ?? emp.shiftStart  ?? "08:00",
    shiftEnd:       emp.shift_end    ?? emp.shiftEnd    ?? "17:00",
    patientCount:   emp.patient_count ?? emp.patientCount ?? 0,
    avatar:         name[0]?.toUpperCase() ?? "?",
  };
}

export function usePMSStore() {
  // State for PMS data (managed locally, fetched from API)
  const [patients, setPatients]         = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [admissions, setAdmissions]     = useState([]);
  const [beds, setBeds]                 = useState([]);
  const [doctors, setDoctors]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // ── Fetch all PMS data on mount ─────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch patients, appointments, admissions, beds in parallel
        const [
          patientsData,
          appointmentsData,
          admissionsData,
          bedsData,
        ] = await Promise.all([
          pmsAPI.getPatients().catch(() => []),
          pmsAPI.getAppointments().catch(() => []),
          pmsAPI.getAdmissions().catch(() => []),
          pmsAPI.getBeds().catch(() => []),
        ]);

        // Fetch doctors via departmentAPI.getDoctors → /employee/get_doctors
        let rawDoctors = [];
        try {
          const res = await departmentAPI.getDoctors();
          rawDoctors = Array.isArray(res) ? res : res?.data ?? [];
        } catch (docErr) {
          console.warn("Could not fetch doctors:", docErr.message);
        }

        setPatients(Array.isArray(patientsData)         ? patientsData         : patientsData?.data         ?? []);
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData     : appointmentsData?.data     ?? []);
        setAdmissions(Array.isArray(admissionsData)     ? admissionsData       : admissionsData?.data       ?? []);
        setBeds(Array.isArray(bedsData)                 ? bedsData             : bedsData?.data             ?? []);
        setDoctors(rawDoctors.map(mapDoctor));

      } catch (err) {
        console.error("Failed to fetch PMS data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Derived: available doctors ──────────────────────────────────────────────
  const availableDoctors = useMemo(
    () => doctors.filter((d) => d.status === "Available" && d.role === "Doctor"),
    [doctors]
  );

  // ── Derived: bed stats ──────────────────────────────────────────────────────
  const bedStats = useMemo(
    () => ({
      total:       beds.length,
      empty:       beds.filter((b) => b.status === "empty").length,
      occupied:    beds.filter((b) => b.status === "occupied").length,
      reserved:    beds.filter((b) => b.status === "reserved").length,
      maintenance: beds.filter((b) => b.status === "maintenance").length,
      occupancyPct: beds.length
        ? Math.round(
            (beds.filter((b) => b.status === "occupied").length / beds.length) * 100
          )
        : 0,
    }),
    [beds]
  );

  // ── Derived: patient stats ──────────────────────────────────────────────────
  const patientStats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total:      patients.length,
      admitted:   patients.filter((p) => p.status === "Admitted").length,
      waiting:    patients.filter((p) => p.status === "Waiting").length,
      discharged: patients.filter((p) => p.status === "Discharged").length,
      today:      patients.filter((p) => {
        try {
          return new Date(p.registeredAt).toDateString() === today;
        } catch {
          return false;
        }
      }).length,
    };
  }, [patients]);

  // ── Register new patient ────────────────────────────────────────────────────
  const registerPatient = useCallback(async (formData) => {
    try {
      // The registration form collects: name (full), age, gender, phone,
      // email, bloodType, visitType, reason, emergencyContact.
      // The DB needs: first_name, last_name, dob, contact_no, blood_type,
      //               emergency_contact_name, emergency_contact_number.
      const nameParts = (formData.name ?? "").trim().split(/\s+/);
      const firstName = nameParts[0] ?? "";
      const lastName  = nameParts.slice(1).join(" ") || firstName;

      // Convert age (integer) → approximate date of birth (YYYY-01-01)
      let dob = formData.dob ?? null;
      if (!dob && formData.age) {
        const birthYear = new Date().getFullYear() - Math.abs(parseInt(formData.age, 10));
        dob = `${birthYear}-01-01`;
      }

      const payload = {
        first_name:               firstName,
        last_name:                lastName,
        email:                    formData.email    ?? "",
        address:                  formData.address  ?? "",
        dob,
        gender:                   formData.gender   ?? "Prefer not to say",
        contact_no:               formData.phone    ?? formData.contact_no ?? "",
        blood_type:               formData.bloodType ?? formData.blood_type ?? null,
        // emergency contact — form has a single "emergencyContact" field for the name
        emergency_contact_name:   formData.emergencyContact ?? formData.emergency_contact_name ?? "",
        emergency_contact_number: formData.emergencyContactNumber ?? formData.emergency_contact_number ?? "",
      };

      await pmsAPI.createPatient(payload);

      // Refetch from DB so the new record (with server-assigned patient_id_display) is visible
      const patientsData = await pmsAPI.getPatients();
      const updated = Array.isArray(patientsData) ? patientsData : patientsData.data ?? [];
      setPatients(updated);
      return updated.find((p) => p.email === payload.email) ?? updated[0];
    } catch (err) {
      console.error("Failed to register patient:", err);
      throw err;
    }
  }, []);

  // ── Assign patient → doctor + bed ───────────────────────────────────────────
  const assignPatient = useCallback(async ({ patientId, doctorId, bedId }) => {
    try {
      const result = await pmsAPI.createAdmission({ patientId, doctorId, bedId });
      const admission = result.data || result;

      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientId ? { ...p, doctorId, bedId, status: "Admitted" } : p
        )
      );

      setBeds((prev) =>
        prev.map((b) =>
          b.id === bedId
            ? { ...b, status: "occupied", patientId, assignedAt: new Date().toISOString() }
            : b
        )
      );

      setAdmissions((prev) => [admission, ...prev]);
      return { patientId, doctorId, bedId };
    } catch (err) {
      console.error("Failed to assign patient:", err);
      throw err;
    }
  }, []);

  // ── Discharge patient ───────────────────────────────────────────────────────
  const dischargePatient = useCallback(async (patientId) => {
    try {
      const patient = patients.find((p) => p.id === patientId);
      if (!patient) throw new Error("Patient not found");

      await pmsAPI.dischargePatient(patientId);

      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientId ? { ...p, status: "Discharged" } : p
        )
      );

      if (patient.bedId) {
        setBeds((prev) =>
          prev.map((b) =>
            b.id === patient.bedId ? { ...b, status: "empty", patientId: null } : b
          )
        );
      }
    } catch (err) {
      console.error("Failed to discharge patient:", err);
      throw err;
    }
  }, [patients]);

  // ── Book appointment ────────────────────────────────────────────────────────
  const bookAppointment = useCallback(async (appointmentData) => {
    try {
      const result = await pmsAPI.createAppointment(appointmentData);
      const newAppointment = result.data || result;
      setAppointments((prev) => [newAppointment, ...prev]);
      return newAppointment;
    } catch (err) {
      console.error("Failed to book appointment:", err);
      throw err;
    }
  }, []);

  // ── Update appointment status ───────────────────────────────────────────────
  const updateAppointmentStatus = useCallback(async (appointmentId, status) => {
    // Optimistic update - update UI immediately
    const previousAppointments = appointments;
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
    );
    
    try {
      await pmsAPI.updateAppointment(appointmentId, { status });
    } catch (err) {
      // Rollback on error
      setAppointments(previousAppointments);
      console.error("Failed to update appointment status:", err);
      throw err;
    }
  }, [appointments]);

  // ── Update bed status manually ──────────────────────────────────────────────
  const updateBedStatus = useCallback(async (bedId, status) => {
    try {
      await pmsAPI.updateBedStatus(bedId, { status });
      setBeds((prev) =>
        prev.map((b) => (b.id === bedId ? { ...b, status, patientId: status === "empty" ? null : b.patientId } : b))
      );
    } catch (err) {
      console.error("Failed to update bed status:", err);
      throw err;
    }
  }, []);

  // ── Update patient info ─────────────────────────────────────────────────────
  const updatePatient = useCallback(async (patientId, data) => {
    try {
      await pmsAPI.updatePatient(patientId, data);
      
      // Refetch to get updated data from server
      const patientsData = await pmsAPI.getPatients();
      const updated = Array.isArray(patientsData) ? patientsData : patientsData.data ?? [];
      setPatients(updated);
      
      return updated.find((p) => p.id === patientId);
    } catch (err) {
      console.error("Failed to update patient:", err);
      throw err;
    }
  }, []);

  return {
    // State
    patients,
    appointments,
    admissions,
    beds,
    doctors,
    loading,
    error,
    // Derived
    availableDoctors,
    bedStats,
    patientStats,
    // Mutations
    registerPatient,
    assignPatient,
    dischargePatient,
    bookAppointment,
    updateAppointmentStatus,
    updateBedStatus,
    updatePatient,
  };
}