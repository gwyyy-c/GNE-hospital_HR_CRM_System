/**
 * useHRStore Hook
 * Custom React hook for HR module data management
 * Handles employees, departments, and schedules CRUD operations
 * @package GNE-Hospital-Management-System
 */
import { useState, useCallback, useEffect } from "react";
import { hrAPI } from "../services/apiClient";
import { INITIAL_EMPLOYEES, DEPARTMENTS as MOCK_DEPARTMENTS } from "../data/HR";

export function useHRStore() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employees, departments, and schedules
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch each independently so one failure doesn't break everything
        const empData = await hrAPI.getEmployees().catch(() => []);
        const deptData = await hrAPI.getDepartments().catch(() => []);
        const schedData = await hrAPI.getSchedules().catch(() => []);

        const employees = Array.isArray(empData) ? empData : empData?.data || [];
        const departments = Array.isArray(deptData) ? deptData : deptData?.data || [];
        const schedules = Array.isArray(schedData) ? schedData : schedData?.data || [];

        // Only use mock data if API returned nothing
        setEmployees(employees.length > 0 ? employees : INITIAL_EMPLOYEES);
        setDepartments(departments.length > 0 ? departments : MOCK_DEPARTMENTS);
        setSchedules(schedules);
      } catch (err) {
        console.warn("Backend unavailable – using demo data:", err.message);
        setEmployees(INITIAL_EMPLOYEES);
        setDepartments(MOCK_DEPARTMENTS);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Employee CRUD 
  const addEmployee = useCallback(async (data) => {
    // Build a complete employee object from the form submission
    const fullName = [data.first_name, data.middle_name, data.last_name]
      .filter(Boolean)
      .join(" ");
    const avatar = [data.first_name?.[0], data.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase();

    try {
      await hrAPI.createEmployee(data);
      // Refetch the full employees list so the new record with its server-assigned
      // ID and display fields appears correctly in the table.
      const empData = await hrAPI.getEmployees();
      const updated = Array.isArray(empData) ? empData : empData.data ?? [];
      setEmployees(updated);
      return updated[0] ?? {};
    } catch (err) {
      // Optimistic insert with a temporary local ID
      console.warn("API unavailable – inserting locally:", err.message);
      const optimistic = {
        id: `local-${Date.now()}`,
        name: fullName,
        email: data.email,
        role: data.role,
        department: data.department,
        status: data.status || "Active",
        shiftStart: data.shiftStart || "08:00",
        shiftEnd: data.shiftEnd || "17:00",
        phone: data.contact_no || "",
        joined: data.hire_date || new Date().toISOString().split("T")[0],
        avatar,
        prc_license_no: data.prc_license_no || null,
      };
      setEmployees((prev) => [optimistic, ...prev]);
      return optimistic;
    }
  }, []);

  const updateEmployee = useCallback(async (id, patch) => {
    // Optimistic update first, then push to server
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
    try {
      const result = await hrAPI.updateEmployee(id, patch);
      return result;
    } catch (err) {
      // Optimistic update already applied locally
      console.warn("API unavailable – applied update locally:", err.message);
    }
  }, []);

  const deleteEmployee = useCallback(async (id) => {
    // Optimistic remove first
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    try {
      await hrAPI.deleteEmployee(id);
    } catch (err) {
      console.warn("API unavailable – delete applied locally:", err.message);
    }
  }, []);

  // Department CRUD 
  const addDepartment = useCallback(async (data) => {
    try {
      await hrAPI.createDepartment(data);
      // Refetch so the new department with its server-assigned ID appears immediately
      const deptData = await hrAPI.getDepartments();
      const updated = Array.isArray(deptData) ? deptData : deptData.data ?? [];
      setDepartments(updated);
      return updated[updated.length - 1] ?? {};
    } catch (err) {
      console.warn("API unavailable – inserting department locally:", err.message);
      const optimistic = { id: `local-dept-${Date.now()}`, staffCount: 0, ...data };
      setDepartments((prev) => [...prev, optimistic]);
      return optimistic;
    }
  }, []);

  const updateDepartment = useCallback(async (id, patch) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
    try {
      const result = await hrAPI.updateDepartment(id, patch);
      return result;
    } catch (err) {
      console.warn("API unavailable – applied dept update locally:", err.message);
    }
  }, []);

  const deleteDepartment = useCallback(async (id) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    try {
      await hrAPI.deleteDepartment(id);
    } catch (err) {
      console.warn("API unavailable – dept delete applied locally:", err.message);
    }
  }, []);

  // Schedule CRUD
  const addSchedule = useCallback(async (data) => {
    try {
      await hrAPI.createSchedule(data);
      const schedData = await hrAPI.getSchedules();
      const updated = Array.isArray(schedData) ? schedData : schedData.data ?? [];
      setSchedules(updated);
      return updated[updated.length - 1] ?? {};
    } catch (err) {
      console.warn("API unavailable – inserting schedule locally:", err.message);
      const optimistic = { id: `local-sched-${Date.now()}`, ...data };
      setSchedules((prev) => [...prev, optimistic]);
      return optimistic;
    }
  }, []);

  const updateSchedule = useCallback(async (id, patch) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id || s.schedule_id === id ? { ...s, ...patch } : s))
    );
    try {
      const result = await hrAPI.updateSchedule(id, patch);
      return result;
    } catch (err) {
      console.warn("API unavailable – applied schedule update locally:", err.message);
    }
  }, []);

  const deleteSchedule = useCallback(async (id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id && s.schedule_id !== id));
    try {
      await hrAPI.deleteSchedule(id);
    } catch (err) {
      console.warn("API unavailable – schedule delete applied locally:", err.message);
    }
  }, []);

  // Derived stats 
  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "Active").length,
    onLeave: employees.filter((e) => e.status === "On Leave").length,
    doctors: employees.filter((e) => e.role === "Doctor").length,
    departments: departments.length,
    newThisMonth: employees.filter((e) => {
      try {
        const joined = new Date(e.joined);
        const now = new Date();
        return joined.getMonth() === now.getMonth() && 
               joined.getFullYear() === now.getFullYear();
      } catch {
        return false;
      }
    }).length,
  };

  return {
    employees,
    departments,
    schedules,
    stats,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  };
}