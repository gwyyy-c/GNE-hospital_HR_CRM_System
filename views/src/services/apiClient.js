// Detect if running through Vite proxy or direct Apache access
const isViteDev = window.location.port === '5173';
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (isViteDev ? "/api" : "/GNE-Hospital-Management-System/api");

//  Token management
export function getToken() {
  return localStorage.getItem("hms_token");
}

export function setToken(token) {
  if (token) {
    localStorage.setItem("hms_token", token);
  }
}

export function clearToken() {
  localStorage.removeItem("hms_token");
}

//  Core fetch wrapper 
export async function apiFetch(
  endpoint,
  options = {}
) {
  const {
    method = "GET",
    body = null,
    headers = {},
    authenticated = true,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add token to authenticated requests
  if (authenticated) {
    const token = getToken();
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers: defaultHeaders,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    if (response.status === 401) {
      // If we are NOT on the login page, it's a real session expiry
      if (!window.location.pathname.includes("/login")) {
        clearToken();
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }
    }

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorData?.error || errorMessage;
      } catch {
        // Response is not JSON, use raw text
        const text = await response.text().catch(() => "");
        errorMessage = text || `Backend service unavailable`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Call Failed: ${endpoint}`, error);
    throw error;
  }
}

// Authentication API 
export const authAPI = {
  login: (email, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: { email, password },
      authenticated: false,
    }),

  logout: () => apiFetch("/auth/logout", { method: "POST" }),
};

// HR Module API
export const hrAPI = {
  getEmployees: () => apiFetch("/employee/get_all"),
  getEmployee: (id) => apiFetch(`/employee/get/${id}`),
  createEmployee: (data) =>
    apiFetch("/employee/create", { method: "POST", body: data }),
  updateEmployee: (id, data) =>
    apiFetch(`/employee/update/${id}`, { method: "PUT", body: data }),
  deleteEmployee: (id) =>
    apiFetch(`/employee/delete/${id}`, { method: "DELETE" }),

  getDepartments: () => apiFetch("/department/get_all"),
  getDepartment: (id) => apiFetch(`/department/get/${id}`),
  createDepartment: (data) =>
    apiFetch("/department/create", { method: "POST", body: data }),
  updateDepartment: (id, data) =>
    apiFetch(`/department/update/${id}`, { method: "PUT", body: data }),
  deleteDepartment: (id) =>
    apiFetch(`/department/delete/${id}`, { method: "DELETE" }),

  getSchedules: () => apiFetch("/schedule/get_all"),
  createSchedule: (data) =>
    apiFetch("/schedule/create", { method: "POST", body: data }),
  updateSchedule: (id, data) =>
    apiFetch(`/schedule/update/${id}`, { method: "PUT", body: data }),
  deleteSchedule: (id) =>
    apiFetch(`/schedule/delete/${id}`, { method: "DELETE" }),
};

// PMS Module API 
export const pmsAPI = {
  getPatients: () => apiFetch("/patient/get_all"),
  getPatient: (id) => apiFetch(`/patient/get/${id}`),
  createPatient: (data) =>
    apiFetch("/patient/register", { method: "POST", body: data }),
  updatePatient: (id, data) =>
    apiFetch(`/patient/update/${id}`, { method: "PUT", body: data }),
  deletePatient: (id) =>
    apiFetch(`/patient/delete/${id}`, { method: "DELETE" }),

  getAppointments: () => apiFetch("/appointment/get_all"),
  getAppointment: (id) => apiFetch(`/appointment/get/${id}`),
  createAppointment: (data) =>
    apiFetch("/appointment/book", { method: "POST", body: data }),
  updateAppointment: (id, data) =>
    apiFetch(`/appointment/update/${id}`, { method: "PUT", body: data }),
  deleteAppointment: (id) =>
    apiFetch(`/appointment/delete/${id}`, { method: "DELETE" }),

  getAdmissions: () => apiFetch("/admission/get_all"),
  getAdmission: (id) => apiFetch(`/admission/get/${id}`),
  createAdmission: (data) =>
    apiFetch("/admission/admit", { method: "POST", body: data }),
  updateAdmission: (id, data) =>
    apiFetch(`/admission/update/${id}`, { method: "PUT", body: data }),
  dischargePatient: (id) =>
    apiFetch(`/admission/discharge/${id}`, { method: "POST" }),

  getBeds: () => apiFetch("/bed/get_all"),
  getAvailableBeds: () => apiFetch("/bed/get_available"),
  getBedStatus: (id) => apiFetch(`/bed/get/${id}`),
  updateBedStatus: (id, data) =>
    apiFetch(`/bed/update/${id}`, { method: "PUT", body: data }),

  getBilling: () => apiFetch("/billing/get_all"),
  getBillingRecord: (id) => apiFetch(`/billing/get/${id}`),
  createBilling: (data) =>
    apiFetch("/billing/create", { method: "POST", body: data }),
  updateBilling: (id, data) =>
    apiFetch(`/billing/update/${id}`, { method: "PUT", body: data }),

  getMedicalRecords: () => apiFetch("/medical_record/get_all"),
  getMedicalRecord: (patientId) =>
    apiFetch(`/medical_record/get/${patientId}`),
  createMedicalRecord: (data) =>
    apiFetch("/medical_record/create", { method: "POST", body: data }),
};

// Doctor Module API 
export const doctorAPI = {
  getDoctorAppointments: (doctorId) =>
    apiFetch(`/appointment/doctor/${doctorId}`),
  getDoctorPatients: (doctorId) => apiFetch(`/patient/doctor/${doctorId}`),
  getMedicalRecords: () => apiFetch("/medical_record/get_all"),
  createMedicalRecord: (data) =>
    apiFetch("/medical_record/create", { method: "POST", body: data }),
  updateMedicalRecord: (id, data) =>
    apiFetch(`/medical_record/update/${id}`, { method: "PUT", body: data }),
};

// Billing Module API
  export const billingAPI = {
  getBillingRecords: () => apiFetch("/billing/get_all"),
  getBillingRecord: (id) => apiFetch(`/billing/get/${id}`),
  createInvoice: (data) =>
    apiFetch("/billing/create", { method: "POST", body: data }),
  updateInvoice: (id, data) =>
    apiFetch(`/billing/update/${id}`, { method: "PUT", body: data }),
  processPayment: (id, data) =>
    apiFetch(`/billing/pay/${id}`, { method: "POST", body: data }),
};

// ── Department API
export const departmentAPI = {
  getDepartments: () => apiFetch("/department/get_all"),
  getDoctors: () => apiFetch("/employee/get_doctors"),
};

export default {
  authAPI,
  hrAPI,
  pmsAPI,
  doctorAPI,
  billingAPI,
  departmentAPI,
};