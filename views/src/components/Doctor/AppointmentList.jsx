// src/components/Doctor/AppointmentList.jsx
import { Clock, Zap, AlertTriangle, ChevronRight, BedDouble, Activity } from "lucide-react";
import { APPT_STATUS, CARE_DECISIONS } from "../../data/Doctor";

const VISIT_COLORS = {
  "Walk-in":    "bg-warning-100 text-warning-700",
  "Appointment":"bg-primary-100 text-primary-700",
  "Emergency":  "bg-danger-100  text-danger-700",
  "Referral":   "bg-violet-100  text-violet-700",
};

const AVATAR_COLORS = [
  "bg-blue-500","bg-violet-500","bg-emerald-500","bg-orange-500",
  "bg-pink-500","bg-cyan-500","bg-amber-600","bg-teal-500",
];

function VitalPill({ label, value, unit, warn }) {
  return (
    <div className={`flex flex-col items-center px-2.5 py-1.5 rounded-lg ${warn ? "bg-danger-50 border border-danger-200" : "bg-surface-100"}`}>
      <span className={`text-[10px] font-bold ${warn ? "text-danger-600" : "text-surface-500"}`}>{label}</span>
      <span className={`text-xs font-bold ${warn ? "text-danger-700" : "text-surface-800"}`}>{value}<span className="font-normal text-[10px] ml-0.5">{unit}</span></span>
    </div>
  );
}

function AppointmentCard({ appt, selected, onSelect, onStartConsult }) {
  const s           = APPT_STATUS[appt.status];
  const care        = appt.careDecision ? CARE_DECISIONS[appt.careDecision] : null;
  const avatarColor = AVATAR_COLORS[appt.patientId?.charCodeAt(1) % AVATAR_COLORS.length] ?? "bg-primary-500";
  const initials    = appt.name.split(" ").map((w) => w[0]).join("").slice(0, 2);

  const vitalsWarning = appt.vitals && (
    appt.vitals.spo2 < 95 ||
    parseInt(appt.vitals.bp) > 140 ||
    appt.vitals.hr > 100 ||
    appt.vitals.temp > 37.5
  );

  return (
    <div
      onClick={() => onSelect(appt)}
      className={`
        group relative rounded-2xl border-2 cursor-pointer transition-all duration-150
        ${selected
          ? "border-primary-500 shadow-lg shadow-primary-100 bg-white"
          : "border-surface-200 bg-white hover:border-primary-300 hover:shadow-md"
        }
      `}
    >
      {/* Priority flag */}
      {appt.priority === "high" && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger-500 text-white text-[10px] font-bold shadow-sm">
            <AlertTriangle className="w-2.5 h-2.5" /> HIGH
          </span>
        </div>
      )}

      {/* Selected indicator */}
      {selected && (
        <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary-600 rounded-r-full" />
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 ${avatarColor}`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-surface-900 truncate">{appt.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${VISIT_COLORS[appt.visitType]}`}>
                {appt.visitType}
              </span>
            </div>
            <p className="text-xs text-surface-500">{appt.age}y · {appt.gender} · {appt.bloodType}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1 text-xs text-surface-500">
              <Clock className="w-3 h-3" />
              {appt.appointmentTime}
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.bg} ${s.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.pulse ? "animate-pulse" : ""}`} />
              {s.label}
            </span>
          </div>
        </div>

        {/* Reason */}
        <p className="text-xs text-surface-600 mb-3 line-clamp-1">{appt.reason}</p>

        {/* Vitals strip */}
        {appt.vitals && (
          <div className="flex gap-1.5 mb-3 flex-wrap">
            <VitalPill label="BP"   value={appt.vitals.bp}    unit="mmHg" warn={parseInt(appt.vitals.bp) > 140} />
            <VitalPill label="HR"   value={appt.vitals.hr}    unit="bpm"  warn={appt.vitals.hr > 100} />
            <VitalPill label="SpO₂" value={`${appt.vitals.spo2}%`} unit="" warn={appt.vitals.spo2 < 95} />
            <VitalPill label="Temp" value={`${appt.vitals.temp}°`}  unit="C" warn={appt.vitals.temp > 37.5} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {appt.bedId && (
              <span className="flex items-center gap-1 text-[10px] text-surface-500 bg-surface-100 px-2 py-1 rounded-lg">
                <BedDouble className="w-3 h-3" /> {appt.bedId}
              </span>
            )}
            {care && (
              <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg ${care.bg} ${care.color}`}>
                {care.icon} {care.label}
              </span>
            )}
          </div>

          {appt.status === "waiting" && (
            <button
              onClick={(e) => { e.stopPropagation(); onStartConsult(appt.id); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-semibold transition-colors"
            >
              <Activity className="w-3 h-3" /> Start
            </button>
          )}
          {appt.status !== "waiting" && (
            <ChevronRight className={`w-4 h-4 transition-transform ${selected ? "text-primary-600 translate-x-0.5" : "text-surface-300"}`} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppointmentList({ appointments, selectedId, onSelect, onStartConsult }) {
  const groups = {
    active:    appointments.filter((a) => ["waiting","in_consult"].includes(a.status)),
    completed: appointments.filter((a) => a.status === "completed"),
    cancelled: appointments.filter((a) => a.status === "cancelled"),
  };

  const Section = ({ title, items, accent }) => (
    items.length > 0 && (
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${accent}`}>{title} · {items.length}</p>
        <div className="space-y-2.5">
          {items.map((a) => (
            <AppointmentCard
              key={a.id} appt={a}
              selected={selectedId === a.id}
              onSelect={onSelect}
              onStartConsult={onStartConsult}
            />
          ))}
        </div>
      </div>
    )
  );

  return (
    <div className="space-y-5">
      <Section title="Active"    items={groups.active}    accent="text-primary-600" />
      <Section title="Completed" items={groups.completed} accent="text-success-600"  />
      <Section title="Cancelled" items={groups.cancelled} accent="text-surface-400"  />
      {appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Clock className="w-10 h-10 text-surface-200 mb-3" />
          <p className="text-sm text-surface-500 font-medium">No appointments today</p>
        </div>
      )}
    </div>
  );
}