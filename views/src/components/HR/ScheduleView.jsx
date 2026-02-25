// src/components/HR/ScheduleView.jsx
// Weekly shift schedule — reads schedules from the HR store (database).
import { useState, useMemo } from "react";
import {
  Clock, Users, ChevronLeft, ChevronRight, Search, Filter,
} from "lucide-react";
import { DEPARTMENTS } from "../../data/HR";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_MAP = { "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6 };

const SHIFT_COLORS = {
  "07:00": { bg: "bg-amber-100",  text: "text-amber-800",  border: "border-amber-300"  },
  "08:00": { bg: "bg-teal-100",   text: "text-teal-800",   border: "border-teal-300"   },
  "09:00": { bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-300"   },
  "06:00": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  "15:00": { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  "23:00": { bg: "bg-gray-200",   text: "text-gray-700",   border: "border-gray-300"   },
};

function getShiftColor(shiftStart) {
  const time = shiftStart?.slice(0, 5) || shiftStart;
  return SHIFT_COLORS[time] ?? { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" };
}

function ShiftBadge({ emp, schedule }) {
  const shiftStart = schedule?.shift_start || emp.shiftStart;
  const shiftEnd = schedule?.shift_end || emp.shiftEnd;
  if (!shiftStart) return null;
  
  const c = getShiftColor(shiftStart);
  const initials = (emp.avatar || emp.name?.slice(0, 2) || "??").toUpperCase();
  const startTime = shiftStart.slice(0, 5);
  const endTime = shiftEnd?.slice(0, 5) || "";
  
  return (
    <div
      className={`
        flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold
        ${c.bg} ${c.text} ${c.border}
      `}
    >
      <span className="w-5 h-5 rounded-md bg-white/60 flex items-center justify-center text-[10px] font-bold shrink-0">
        {initials}
      </span>
      <span className="truncate max-w-[90px]" title={emp.name}>{emp.name}</span>
      <span className="opacity-70 shrink-0">{startTime}–{endTime}</span>
    </div>
  );
}

/** Returns the Monday of the week containing `date` */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ScheduleView({ employees = [], schedules = [] }) {
  const [weekStart, setWeekStart]   = useState(() => getWeekStart(new Date()));
  const [search,    setSearch]      = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const weekDates = useMemo(() =>
    DAYS.map((_, i) => addDays(weekStart, i)),
  [weekStart]);

  // Build a map of employee schedules by day
  const schedulesByEmpAndDay = useMemo(() => {
    const map = {};
    schedules.forEach((s) => {
      const empId = s.emp_id;
      const dayIndex = DAY_MAP[s.day_of_week] ?? -1;
      if (dayIndex >= 0) {
        if (!map[empId]) map[empId] = {};
        map[empId][dayIndex] = s;
      }
    });
    return map;
  }, [schedules]);

  const filtered = useMemo(() =>
    employees.filter((e) => {
      if (deptFilter !== "all" && e.department !== deptFilter) return false;
      if (search && !e.name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
  [employees, deptFilter, search]);

  // Group by department for summary stats
  const byDept = useMemo(() => {
    const map = {};
    filtered.forEach((e) => {
      const d = e.department || "Other";
      if (!map[d]) map[d] = [];
      map[d].push(e);
    });
    return map;
  }, [filtered]);

  const shiftSummary = useMemo(() => {
    const groups = {};
    // Count from schedules data
    schedules.forEach((s) => {
      const start = s.shift_start?.slice(0, 5);
      const end = s.shift_end?.slice(0, 5);
      if (!start) return;
      const label = `${start}–${end}`;
      groups[label] = (groups[label] || 0) + 1;
    });
    // Fallback to employee shift data if no schedules
    if (Object.keys(groups).length === 0) {
      filtered.forEach((e) => {
        if (!e.shiftStart) return;
        const label = `${e.shiftStart}–${e.shiftEnd}`;
        groups[label] = (groups[label] || 0) + 1;
      });
    }
    return Object.entries(groups).sort();
  }, [schedules, filtered]);

  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d,  7));
  const goToday  = () => setWeekStart(getWeekStart(new Date()));

  const todayStr = new Date().toDateString();

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Week nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="p-2 rounded-lg hover:bg-surface-100 border border-surface-200 text-surface-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-surface-700 min-w-[160px] text-center">
            {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
          </span>
          <button
            onClick={nextWeek}
            className="p-2 rounded-lg hover:bg-surface-100 border border-surface-200 text-surface-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-surface-200 hover:bg-surface-100 text-surface-600 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff…"
              className="pl-8 pr-3 py-2 rounded-xl text-sm border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500 transition-colors w-44"
            />
          </div>
          {/* Dept filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-surface-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="py-2 pl-2 pr-6 rounded-xl text-sm border border-surface-200 bg-white focus:outline-none appearance-none"
            >
              <option value="all">All Depts</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
          <Users className="w-3.5 h-3.5" /> {filtered.length} staff scheduled
        </span>
        {shiftSummary.map(([label, count]) => (
          <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-100 text-surface-600">
            <Clock className="w-3 h-3" /> {label} · {count}
          </span>
        ))}
      </div>

      {/* Weekly Grid */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-200">
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-surface-500 w-28">
                Department
              </th>
              {weekDates.map((date, i) => {
                const isToday = date.toDateString() === todayStr;
                return (
                  <th
                    key={i}
                    className={`px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider ${isToday ? "text-primary-600 bg-primary-50" : "text-surface-500"}`}
                  >
                    <div>{DAYS[i]}</div>
                    <div className={`text-xs font-semibold mt-0.5 ${isToday ? "text-primary-600" : "text-surface-400"}`}>
                      {formatDate(date)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {Object.keys(byDept).length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-surface-400 text-sm">
                  No staff match your filters.
                </td>
              </tr>
            ) : (
              Object.entries(byDept).map(([dept, emps]) => (
                <tr key={dept} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3 align-top">
                    <p className="text-xs font-bold text-surface-700 leading-tight">{dept}</p>
                    <p className="text-[10px] text-surface-400 mt-0.5">{emps.length} staff</p>
                  </td>
                  {weekDates.map((_, i) => (
                    <td key={i} className={`px-2 py-2 align-top ${i === new Date().getDay() - 1 ? "bg-primary-50/40" : ""}`}>
                      <div className="flex flex-col gap-1">
                        {emps
                          .filter((e) => e.status !== "Inactive")
                          .map((emp) => {
                            // Get schedule for this employee on this day
                            const empId = emp.id;
                            const daySchedule = schedulesByEmpAndDay[empId]?.[i];
                            // Show if there's a schedule for this day, or fallback to employee's default shift
                            if (daySchedule || emp.shiftStart) {
                              return <ShiftBadge key={emp.id} emp={emp} schedule={daySchedule} />;
                            }
                            return null;
                          })}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(SHIFT_COLORS).map(([time, c]) => (
          <span key={time} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-semibold ${c.bg} ${c.text} ${c.border}`}>
            <Clock className="w-3 h-3" /> Shift from {time}
          </span>
        ))}
      </div>
    </div>
  );
}
