import { useState, useCallback }   from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Users, UserCheck, UserX, Stethoscope, Building2,
  TrendingUp, AlertCircle, Loader, Calendar,
} from "lucide-react";
import { useHRStore }         from "../hooks/useHRStore";
import { useSearch }          from "../context/SearchContext";
import EmployeeTable          from "../components/HR/EmployeeTable";
import Department             from "../components/HR/Department";
import AddEmployee            from "../components/HR/AddEmployee";
import ScheduleView           from "../components/HR/ScheduleView";
import Toast                  from "../components/ui/Toast";
import DashboardBanner        from "../components/ui/DashboardBanner";

// Stat card 
function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  const colorMap = {
    blue:   { icon: "bg-primary-100 text-primary-600", border: "border-primary-200" },
    green:  { icon: "bg-success-100 text-success-600", border: "border-success-200" },
    amber:  { icon: "bg-warning-100 text-warning-600", border: "border-warning-200" },
    purple: { icon: "bg-violet-100 text-violet-600",   border: "border-violet-200"  },
    teal:   { icon: "bg-teal-100 text-teal-600",       border: "border-teal-200"    },
  };
  const c = colorMap[color] ?? colorMap.blue;

  return (
    <div className={`bg-white rounded-2xl border ${c.border} shadow-card p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-display font-bold text-surface-900 leading-none">{value}</p>
        <p className="text-xs font-medium text-surface-500 mt-0.5">{label}</p>
        {sub && (
          <p className="text-[11px] text-surface-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-success-500" />
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// Tab button 
function Tab({ label, icon: Icon, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold
        transition-all border-2
        ${active
          ? "bg-white border-primary-200 text-primary-700 shadow-sm"
          : "border-transparent text-surface-500 hover:text-surface-700 hover:bg-white/50"
        }
      `}
    >
      <Icon className={`w-4 h-4 ${active ? "text-primary-600" : "text-surface-400"}`} />
      {label}
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${active ? "bg-primary-100 text-primary-700" : "bg-surface-200 text-surface-500"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// Map URL path segments → tab names
const PATH_TAB = {
  employees:   "employees",
  departments: "departments",
  schedules:   "schedules",
  recruitment: "employees",
  leave:       "employees",
};

// Main 
export default function HRDashboard() {
  const {
    employees, departments, schedules, stats, loading, error,
    addEmployee, updateEmployee, deleteEmployee,
    addDepartment, updateDepartment, deleteDepartment,
    addSchedule, updateSchedule, deleteSchedule,
  } = useHRStore();

  const location = useLocation();
  const navigate  = useNavigate();
  const { query: searchQuery } = useSearch();

  // Derive active tab from URL; fall back to "employees"
  const segment  = location.pathname.split("/").filter(Boolean).pop();
  const activeTab = PATH_TAB[segment] ?? "employees";

  const [showAddModal,   setShowAddModal]   = useState(false);
  const [editingEmp,     setEditingEmp]     = useState(null);
  const [toast,          setToast]          = useState(null);

  const showToast = useCallback((type, message) => setToast({ type, message }), []);

  // Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-surface-600 font-medium">Loading HR data...</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="max-w-md bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Failed to Load Data</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <DashboardBanner />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Staff"    value={stats.total}       icon={Users}        color="blue"   sub={`+${stats.newThisMonth} this month`} />
        <StatCard label="Active"         value={stats.active}      icon={UserCheck}    color="green"  />
        <StatCard label="On Leave"       value={stats.onLeave}     icon={UserX}        color="amber"  />
        <StatCard label="Doctors"        value={stats.doctors}     icon={Stethoscope}  color="purple" />
        <StatCard label="Departments"    value={stats.departments} icon={Building2}    color="teal"   />
      </div>

      {/* Tabs */}
      <div className="bg-surface-100 rounded-2xl p-1.5 flex gap-1 flex-wrap">
        <Tab
          label="Employees"
          icon={Users}
          active={activeTab === "employees"}
          onClick={() => navigate("/hr/employees")}
          count={employees.length}
        />
        <Tab
          label="Departments"
          icon={Building2}
          active={activeTab === "departments"}
          onClick={() => navigate("/hr/departments")}
          count={departments.length}
        />
        <Tab
          label="Schedules"
          icon={Calendar}
          active={activeTab === "schedules"}
          onClick={() => navigate("/hr/schedules")}
        />
      </div>

      {/* Tab Content */}
      {activeTab === "employees" && (
        <EmployeeTable
          employees={employees}
          globalFilterOverride={searchQuery}
          onAdd={() => setShowAddModal(true)}
          onEdit={(emp) => setEditingEmp(emp)}
          onDelete={async (id) => { await deleteEmployee(id); }}
          onStatusChange={async (id, status) => { await updateEmployee(id, { status }); }}
        />
      )}

      {activeTab === "departments" && (
        <Department
          departments={departments}
          onAdd={async (data) => {
            try {
              await addDepartment(data);
              showToast("success", "Department added successfully!");
            } catch {
              showToast("error", "Failed to add department. Please try again.");
            }
          }}
          onUpdate={async (id, data) => { await updateDepartment(id, data); }}
          onDelete={async (id) => { await deleteDepartment(id); }}
        />
      )}

      {activeTab === "schedules" && (
        <ScheduleView employees={employees} schedules={schedules} />
      )}

      {/* Add Employee */}
      {showAddModal && (
        <AddEmployee
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            try {
              await addEmployee(data);
              setShowAddModal(false);
              showToast("success", "Employee added successfully!");
            } catch {
              showToast("error", "Failed to add employee. Please try again.");
            }
          }}
        />
      )}

      {/* Edit Employee Modal */}
      {editingEmp && (
        <AddEmployee
          initialData={editingEmp}
          onClose={() => setEditingEmp(null)}
          onSave={async (data) => {
            const fullName = [data.first_name, data.middle_name, data.last_name]
              .filter(Boolean).join(" ");
            try {
              await updateEmployee(editingEmp.id, {
                name:           fullName,
                email:          data.email,
                role:           data.role,
                department:     data.department,
                status:         data.status,
                shiftStart:     data.shiftStart,
                shiftEnd:       data.shiftEnd,
                phone:          data.contact_no,
                joined:         data.hire_date,
                prc_license_no: data.prc_license_no,
              });
              setEditingEmp(null);
              showToast("success", "Employee updated successfully!");
            } catch {
              showToast("error", "Failed to update employee.");
            }
          }}
        />
      )}

      {/* Toast notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}