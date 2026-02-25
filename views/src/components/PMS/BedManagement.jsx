import { useState } from "react";
import { BedDouble, User, Clock, Stethoscope, Filter, ChevronDown, Edit3, X, Check, AlertTriangle } from "lucide-react";
import { WARDS, BED_STATUS_STYLES } from "../../data/pmsData";

const STATUS_FILTERS = ["all", "empty", "occupied", "reserved", "maintenance"];
const EDITABLE_STATUSES = ["empty", "reserved", "maintenance"];

// Bed Status Edit Modal
function BedStatusEditModal({ bed, onClose, onSave }) {
  const [newStatus, setNewStatus] = useState(bed.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (newStatus === bed.status) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await onSave(bed.id, newStatus);
      onClose();
    } catch (err) {
      console.error("Failed to update bed status:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <BedDouble className="w-5 h-5 text-primary-600" />
            </span>
            <div>
              <h3 className="font-bold text-surface-900">Edit Bed Status</h3>
              <p className="text-xs text-surface-500">Bed {bed.id} · {bed.wardName || "General"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 text-surface-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {bed.status === "occupied" && (
          <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />
              <div className="text-xs text-warning-700">
                <strong>Bed is currently occupied.</strong> To free this bed, please discharge the patient through the billing system.
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-2">
            Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EDITABLE_STATUSES.map((status) => {
              const style = BED_STATUS_STYLES[status];
              const isActive = newStatus === status;
              const isDisabled = bed.status === "occupied" && status !== "occupied";
              return (
                <button
                  key={status}
                  type="button"
                  disabled={bed.status === "occupied"}
                  onClick={() => setNewStatus(status)}
                  className={`
                    flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 
                    text-sm font-semibold capitalize transition-all
                    ${isActive 
                      ? `${style.bg} ${style.border || 'border-current'} ${style.text} shadow-sm` 
                      : "bg-white border-surface-200 text-surface-600 hover:border-surface-300"
                    }
                    ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                  {status === "empty" ? "Available" : status}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-surface-300 text-surface-700 font-semibold text-sm hover:bg-surface-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || bed.status === "occupied" || newStatus === bed.status}
            className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? "Saving..." : <><Check className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function BedCell({ bed, selected, onSelect, onEdit, canEdit = false }) {
  const style  = BED_STATUS_STYLES[bed.status];
  const isClickable = bed.status === "empty";
  const isSelected  = selected?.id === bed.id;

  const handleClick = () => {
    if (isClickable) {
      onSelect(bed);
    } else if (canEdit && onEdit) {
      onEdit(bed);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={
        bed.status === "occupied"
          ? `${bed.patientName} · ${bed.doctorName}${canEdit ? " (Click to view)" : ""}`
          : bed.status === "reserved"
          ? `Reserved${canEdit ? " (Click to edit)" : ""}`
          : bed.status === "maintenance"
          ? `Under maintenance${canEdit ? " (Click to edit)" : ""}`
          : `Bed ${bed.number} — Available`
      }
      className={`
        relative group flex flex-col items-center justify-center
        w-full aspect-square rounded-xl border-2 transition-all duration-150
        ${style.bg} ${style.border}
        ${isClickable
          ? isSelected
            ? "ring-2 ring-primary-500 ring-offset-1 border-primary-400 scale-105 shadow-md"
            : "hover:scale-105 hover:shadow-md cursor-pointer hover:border-primary-300"
          : canEdit
            ? "hover:scale-105 hover:shadow-md cursor-pointer hover:ring-2 hover:ring-primary-300"
            : "cursor-default"
        }
      `}
    >
      {/* Bed number */}
      <span className={`text-[10px] font-bold leading-none mb-1 ${style.text}`}>
        {bed.id}
      </span>

      {/* Icon */}
      {bed.status === "empty" ? (
        <BedDouble className={`w-5 h-5 ${style.text} opacity-60`} />
      ) : bed.status === "occupied" ? (
        <User className="w-5 h-5 text-danger-500" />
      ) : bed.status === "reserved" ? (
        <Clock className="w-5 h-5 text-warning-500" />
      ) : (
        <span className="text-base">🔧</span>
      )}

      {/* Patient name tooltip (occupied) */}
      {bed.status === "occupied" && (
        <div className="
          absolute -top-14 left-1/2 -translate-x-1/2 z-10
          hidden group-hover:flex flex-col
          bg-surface-900 text-white rounded-lg px-2.5 py-2 text-[10px] font-medium
          whitespace-nowrap shadow-xl pointer-events-none
        ">
          <span className="text-white font-semibold">{bed.patientName}</span>
          <span className="text-surface-400 flex items-center gap-1 mt-0.5">
            <Stethoscope className="w-2.5 h-2.5" />{bed.doctorName}
          </span>
          {/* Arrow */}
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-900 rotate-45" />
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-primary-600" />
      )}
    </button>
  );
}

function WardSection({ ward, beds, selectedBed, onSelectBed, statusFilter, canEdit = false, onEditBed }) {
  const [collapsed, setCollapsed] = useState(false);
  const wardBeds = beds.filter((b) => b.wardId === ward.id);
  const filtered = statusFilter === "all"
    ? wardBeds
    : wardBeds.filter((b) => b.status === statusFilter);

  const stats = {
    empty:    wardBeds.filter((b) => b.status === "empty").length,
    occupied: wardBeds.filter((b) => b.status === "occupied").length,
    total:    wardBeds.length,
  };

  const occupancyPct = Math.round((stats.occupied / stats.total) * 100);

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
      {/* Ward header */}
      <button
        type="button"
        onClick={() => setCollapsed((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Color swatch */}
          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: ward.color }} />
          <div className="text-left">
            <p className="text-sm font-bold text-surface-900">{ward.name}</p>
            <p className="text-[11px] text-surface-500">
              {stats.occupied}/{stats.total} occupied
              {" · "}
              <span className="text-success-600 font-semibold">{stats.empty} available</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini occupancy bar */}
          <div className="hidden sm:block w-24">
            <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${occupancyPct}%`,
                  background: occupancyPct > 80 ? "#dc2626" : occupancyPct > 50 ? "#d97706" : ward.color,
                }}
              />
            </div>
            <p className="text-[10px] text-surface-400 mt-0.5 text-right">{occupancyPct}%</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
        </div>
      </button>

      {/* Bed grid */}
      {!collapsed && (
        <div className="px-4 pb-4">
          {filtered.length === 0 ? (
            <p className="text-xs text-surface-400 py-4 text-center">No beds match the current filter.</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
              {filtered.map((bed) => (
                <BedCell
                  key={bed.id}
                  bed={bed}
                  selected={selectedBed}
                  onSelect={onSelectBed}
                  canEdit={canEdit}
                  onEdit={onEditBed}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BedManagement({ beds, selectedBed, onSelectBed, canEdit = false, onUpdateBedStatus }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [wardFilter,   setWardFilter]   = useState("all");
  const [editingBed, setEditingBed] = useState(null);

  const totalStats = {
    empty:    beds.filter((b) => b.status === "empty").length,
    occupied: beds.filter((b) => b.status === "occupied").length,
    reserved: beds.filter((b) => b.status === "reserved").length,
    maintenance: beds.filter((b) => b.status === "maintenance").length,
  };

  const handleEditBed = (bed) => {
    setEditingBed(bed);
  };

  const handleSaveBedStatus = async (bedId, newStatus) => {
    if (onUpdateBedStatus) {
      await onUpdateBedStatus(bedId, newStatus);
    }
  };

  const filteredWards = wardFilter === "all"
    ? WARDS
    : WARDS.filter((w) => w.id === wardFilter);

  return (
    <div>
      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-surface-900">Bed Management</h3>
          <p className="text-[11px] text-surface-500">
            {beds.length} total · {totalStats.empty} available · {totalStats.occupied} occupied
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-400 shrink-0" />
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="py-2 pl-3 pr-7 rounded-xl text-xs border border-surface-200 bg-white focus:outline-none appearance-none"
          >
            <option value="all">All Wards</option>
            {WARDS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 pl-3 pr-7 rounded-xl text-xs border border-surface-200 bg-white focus:outline-none appearance-none capitalize"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s} className="capitalize">{s === "all" ? "All Statuses" : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { key: "empty",       label: "Available",    count: totalStats.empty,       color: "bg-success-400" },
          { key: "occupied",    label: "Occupied",     count: totalStats.occupied,    color: "bg-danger-400"  },
          { key: "reserved",    label: "Reserved",     count: totalStats.reserved,    color: "bg-warning-400" },
          { key: "maintenance", label: "Maintenance",  count: totalStats.maintenance, color: "bg-surface-400" },
        ].map(({ key, label, count, color }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
              ${statusFilter === key ? "bg-surface-800 text-white border-surface-800" : "bg-white text-surface-600 border-surface-200 hover:border-surface-300"}`}
          >
            <span className={`w-2 h-2 rounded-sm ${color}`} />
            {label}
            <span className={`text-[10px] font-bold ${statusFilter === key ? "text-white/70" : "text-surface-400"}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Ward sections */}
      <div className="space-y-3">
        {filteredWards.map((ward) => (
          <WardSection
            key={ward.id}
            ward={ward}
            beds={beds}
            selectedBed={selectedBed}
            onSelectBed={onSelectBed}
            statusFilter={statusFilter}
            canEdit={canEdit}
            onEditBed={handleEditBed}
          />
        ))}
      </div>

      {selectedBed && (
        <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl">
          <BedDouble className="w-4 h-4 text-primary-600 shrink-0" />
          <p className="text-xs font-semibold text-primary-700">
            Bed <strong>{selectedBed.id}</strong> selected — {selectedBed.wardName}
          </p>
        </div>
      )}

      {/* Edit Bed Status Modal */}
      {editingBed && canEdit && (
        <BedStatusEditModal
          bed={editingBed}
          onClose={() => setEditingBed(null)}
          onSave={handleSaveBedStatus}
        />
      )}
    </div>
  );
}