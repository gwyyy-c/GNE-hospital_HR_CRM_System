// src/services/authService.js
// ─────────────────────────────────────────────────────────────────────────────
// Authentication service with PHP backend integration.
// Uses token-based auth stored in localStorage for session persistence.
// ─────────────────────────────────────────────────────────────────────────────

import { authAPI, setToken, clearToken } from "./apiClient";

const TOKEN_KEY  = "hms_token";
const USER_KEY   = "hms_user";

// ── Role → dashboard route map ───────────────────────────────────────────────
// IMPORTANT: These keys (HR, Doctor, FrontDesk) must match your DB ENUM exactly.
export const ROLE_ROUTES = {
  HR:        "/hr/dashboard",
  Doctor:    "/doctor/dashboard",
  FrontDesk: "/pms/dashboard",
  Billing:   "/billing/dashboard",
};

// ── Decode JWT without verification (kept for potential future JWT migration) ──
export function decodeToken(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = decodeURIComponent(
      escape(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ── Core login function with real API ──────────────────────────────────────
/**
 * @param {object} credentials - { email: string, password: string }
 * @returns {{ token: string, user: object, redirectTo: string }}
 * @throws {Error} on authentication failure
 */
export async function login({ email, password }) {
  try {
    // 1. Call backend API
    const response = await authAPI.login(email, password);

    // 2. Extract token from PHP response
    const token = response.token || response.access_token;
    if (!token) {
      throw new Error("No token received from server");
    }

    // 3. Get user data directly from response (PHP returns user object)
    const userData = response.user;
    if (!userData) {
      throw new Error("No user data received from server");
    }
    
    // 4. Map PHP fields to React fields 
    const userRole = userData.role || userData.access_role;
    
    const user = {
      id: userData.id,  // emp_id for foreign key relations
      user_id: userData.user_id,
      name: userData.name,
      role: userRole,
      department: userData.department_id || 'General',
      email: userData.email || email,
      emp_id_display: userData.emp_id_display,
      avatar: (userData.name || email)
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    };

    // 5. Store in localStorage immediately
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // 6. Update the API Client with the new token
    setToken(token);

    return {
      token,
      user,
      redirectTo: ROLE_ROUTES[userRole] ?? "/dashboard",
    };
  } catch (error) {
    console.error("Login service error:", error);
    throw new Error(error.message || "Login failed. Please try again.");
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearToken();
}

// ── Session helpers ───────────────────────────────────────────────────────────
export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// ── Check if user has valid session ────────────────────────────────────────────
export function isAuthenticated() {
  const token = getStoredToken();
  if (!token) return false;

  // Simple token validation - check if token exists and user data is stored
  const user = getStoredUser();
  if (!user) return false;

  return true;
}