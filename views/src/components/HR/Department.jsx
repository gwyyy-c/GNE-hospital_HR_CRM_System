// src/components/HR/DepartmentGrid.jsx
import { useState } from "react";
import { Plus, Edit3, Trash2, Users, X, Check, Building2 } from "lucide-react";

const PRESET_COLORS = [
  "#2563eb","#dc2626","#16a34a","#9333ea","#ea580c",
  "#0891b2","#7c3aed","#0d9488","#d97706","#be185d",
];
const PRESET_ICONS  = ["🏥","🫀","🧠","🦷","💊","🩻","🔬","🧬","🩺","🚨","👶","💓","👁️","🦴","🫁"];

const inputCls = "w-full px-3 py-2 rounded-lg text-sm border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500 transition-colors";

function DeptCardEditor({ dept, onSave, onCancel }) {
  const [name,  setName]  = useState(dept.name  ?? "");
  const [head,  setHead]  = useState(dept.head  ?? "");
  const [color, setColor] = useState(dept.color ?? PRESET_COLORS[0]);
  const [icon,  setIcon]  = useState(dept.icon  ?? "🏥");

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ ...dept, name, head, color, icon });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-primary-300 shadow-lg p-5 space-y-3">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-surface-500 mb-1 block">Department Name</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Orthopedics" autoFocus />
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-surface-500 mb-1 block">Department Head</label>
        <input className={inputCls} value={head} onChange={(e) => setHead(e.target.value)} placeholder="e.g. Dr. Jane Doe" />
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-surface-500 mb-1.5 block">Icon</label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${icon === ic ? "bg-primary-100 ring-2 ring-primary-500" : "hover:bg-surface-100"}`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-surface-500 mb-1.5 block">Color</label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{ background: c }}
              className={`w-6 h-6 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-surface-700 scale-110" : "hover:scale-110"}`}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors">
          <Check className="w-3.5 h-3.5" /> Save
        </button>
        <button onClick={onCancel} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-600 text-xs font-semibold transition-colors">
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

function DeptCard({ dept, onEdit, onDelete }) {
  return (
    <div className="group bg-white rounded-2xl border border-surface-200 shadow-card hover:shadow-md hover:border-surface-300 transition-all overflow-hidden">
      {/* Color bar */}
      <div className="h-1.5" style={{ background: dept.color }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: `${dept.color}15` }}
            >
              {dept.icon}
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-surface-900 leading-tight">{dept.name}</h3>
              <p className="text-xs text-surface-500 mt-0.5">{dept.head}</p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(dept)}
              className="p-1.5 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(dept.id)}
              className="p-1.5 rounded-lg hover:bg-danger-50 text-surface-400 hover:text-danger-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: `${dept.color}10` }}
        >
          <Users className="w-3.5 h-3.5" style={{ color: dept.color }} />
          <span className="text-xs font-semibold" style={{ color: dept.color }}>
            {dept.staffCount} staff members
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Department({ departments, onAdd, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null); // null = not editing, "new" = adding
  const [editData,  setEditData]  = useState(null);

  const startEdit = (dept) => { setEditingId(dept.id); setEditData(dept); };
  const startAdd  = ()     => { setEditingId("new");  setEditData({});    };
  const cancel    = ()     => { setEditingId(null);   setEditData(null);  };

  const handleSave = (data) => {
    if (editingId === "new") onAdd(data);
    else                     onUpdate(editingId, data);
    cancel();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-bold text-surface-900">Departments</h2>
          <p className="text-xs text-surface-500">{departments.length} departments · manage structure</p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {/* New card editor */}
        {editingId === "new" && (
          <DeptCardEditor key="new" dept={{}} onSave={handleSave} onCancel={cancel} />
        )}

        {departments.map((dept) =>
          editingId === dept.id ? (
            <DeptCardEditor
              key={dept.id}
              dept={editData}
              onSave={handleSave}
              onCancel={cancel}
            />
          ) : (
            <DeptCard
              key={dept.id}
              dept={dept}
              onEdit={startEdit}
              onDelete={onDelete}
            />
          )
        )}
      </div>

      {departments.length === 0 && editingId !== "new" && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="w-10 h-10 text-surface-300 mb-3" />
          <p className="text-surface-500 text-sm font-medium">No departments yet</p>
          <p className="text-surface-400 text-xs">Click "Add Department" to get started</p>
        </div>
      )}
    </div>
  );
}
