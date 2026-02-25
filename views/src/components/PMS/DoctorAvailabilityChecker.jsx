// src/components/PMS/DoctorAvailabilityChecker.jsx
import { useState } from "react";
import {
  Stethoscope, Clock, Users, Search, CheckCircle2,
  AlertCircle, XCircle, Coffee, RefreshCw,
} from "lucide-react";
import { DOCTOR_STATUS_STYLES } from "../../data/pmsData";

const STATUS_ICON = {
  "Available":  CheckCircle2,
  "Busy":       AlertCircle,
  "In Surgery": XCircle,
  "Off Shift":  Coffee,
};

function DoctorCard({ doctor, selected, onSelect, disabled }) {
  const styles    = DOCTOR_STATUS_STYLES[doctor.status] ?? DOCTOR_STATUS_STYLES["Off Shift"];
  const Icon      = STATUS_ICON[doctor.status] ?? Coffee;
  const isAvail   = doctor.status === "Available" && doctor.currentShift;
  const initColors= ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-orange-500","bg-pink-500","bg-cyan-500","bg-amber-500"];
  const avatarBg  = initColors[doctor.id.charCodeAt(1) % initColors.length];

  return (
    <button
      type="button"
      onClick={() => isAvail && !disabled && onSelect(doctor)}
      disabled={!isAvail || disabled}
      className={`
        w-full text-left p-4 rounded-xl border-2 transition-all
        ${selected
          ? "border-primary-500 bg-primary-50 shadow-md shadow-primary-100"
          : isAvail
            ? "border-surface-200 bg-white hover:border-primary-300 hover:shadow-sm cursor-pointer"
            : "border-surface-200 bg-surface-50 cursor-not-allowed opacity-60"
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white ${avatarBg}`}>
            {doctor.avatar}
          </span>
          {selected && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface-900 truncate">{doctor.name}</p>
          <p className="text-xs text-surface-500 truncate">{doctor.specialization}</p>
        </div>
      </div>

      {/* Status + Shift */}
      <div className="mt-3 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${styles.bg} ${styles.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
          {doctor.status}
        </span>
        <div className="flex items-center gap-3 text-[11px] text-surface-400">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {doctor.patientCount} pts
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {doctor.currentShift ? `${doctor.shiftStart}–${doctor.shiftEnd}` : "Off"}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function DoctorAvailabilityChecker({
  doctors,
  selectedDoctor,
  onSelectDoctor,
  showAllToggle = true,
}) {
  const [search,   setSearch]   = useState("");
  const [showAll,  setShowAll]  = useState(false);
  const [specFilter, setSpecFilter] = useState("all");

  // All unique specializations
  const specializations = [...new Set(doctors.map((d) => d.specialization))].sort();

  const filtered = doctors.filter((d) => {
    const matchesShift  = showAll || (d.status === "Available" && d.currentShift);
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                          d.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesSpec   = specFilter === "all" || d.specialization === specFilter;
    return matchesShift && matchesSearch && matchesSpec;
  });

  const available = doctors.filter((d) => d.status === "Available" && d.currentShift).length;

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-surface-200 bg-surface-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-success-600" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-surface-900">Doctor Availability</h3>
              <p className="text-[11px] text-surface-500">
                <span className="text-success-600 font-semibold">{available} available</span>
                {" · "}{doctors.length} total
              </p>
            </div>
          </div>
          {showAllToggle && (
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-surface-500 font-medium">Show all</span>
              <div
                onClick={() => setShowAll((p) => !p)}
                className={`relative w-9 h-5 rounded-full transition-colors ${showAll ? "bg-primary-600" : "bg-surface-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showAll ? "translate-x-4" : ""}`} />
              </div>
            </label>
          )}
        </div>

        {/* Search + spec filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctors…"
              className="w-full pl-8 pr-3 py-2 rounded-lg text-xs border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
            />
          </div>
          <select
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
            className="py-2 pl-2 pr-6 rounded-lg text-xs border border-surface-200 bg-white focus:outline-none appearance-none text-surface-600"
          >
            <option value="all">All Specialties</option>
            {specializations.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Doctor cards list */}
      <div className="p-3 space-y-2 max-h-[380px] overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <RefreshCw className="w-6 h-6 text-surface-300 mb-2" />
            <p className="text-sm font-medium text-surface-500">No available doctors</p>
            <p className="text-xs text-surface-400 mt-0.5">
              {showAll ? "Try adjusting your search" : "Toggle 'Show all' to see everyone"}
            </p>
          </div>
        ) : (
          filtered.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              selected={selectedDoctor?.id === doc.id}
              onSelect={onSelectDoctor}
              disabled={false}
            />
          ))
        )}
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-surface-200 bg-surface-50 flex flex-wrap gap-3">
        {Object.entries(DOCTOR_STATUS_STYLES).map(([status, s]) => (
          <span key={status} className="flex items-center gap-1.5 text-[10px] text-surface-500">
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {status}
          </span>
        ))}
      </div>
    </div>
  );
}