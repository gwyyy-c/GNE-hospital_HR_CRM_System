import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  UserPlus, Clock, Edit3, Trash2, MoreHorizontal,
  Filter,
} from "lucide-react";
import { DEPARTMENTS, STATUS_COLORS, ROLE_COLORS } from "../../data/HR";

const colHelper = createColumnHelper();

// ── Avatar cell ────────────────────────────────────────────────────────────────
function Avatar({ row }) {
  const emp = row.original;
  const colors = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-orange-500","bg-pink-500","bg-cyan-500","bg-amber-500"];
  // Handle both numeric and string IDs
  const idValue = typeof emp.id === 'number' ? emp.id : (emp.id?.charCodeAt?.(1) || 0);
  const bg = colors[idValue % colors.length];
  // Generate avatar from name if not provided
  const avatar = emp.avatar || (emp.name ? emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??');
  return (
    <div className="flex items-center gap-3 min-w-[180px]">
      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 ${bg}`}>
        {avatar}
      </span>
      <div>
        <p className="text-sm font-semibold text-surface-900 leading-tight">{emp.name}</p>
        <p className="text-xs text-surface-500">{emp.email}</p>
      </div>
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────────
function StatusBadge({ value }) {
  const c = STATUS_COLORS[value] ?? STATUS_COLORS["Active"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {value}
    </span>
  );
}

// ── Role badge ─────────────────────────────────────────────────────────────────
function RoleBadge({ value }) {
  const cls = ROLE_COLORS[value] ?? "bg-surface-100 text-surface-600";
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{value}</span>;
}

// ── Shift cell ─────────────────────────────────────────────────────────────────
function ShiftCell({ row }) {
  const { shiftStart, shiftEnd } = row.original;
  if (!shiftStart) return <span className="text-surface-400 text-xs">—</span>;
  return (
    <div className="flex items-center gap-1.5 text-xs text-surface-600">
      <Clock className="w-3 h-3 text-surface-400 shrink-0" />
      {shiftStart} – {shiftEnd}
    </div>
  );
}

// ── Sort icon ──────────────────────────────────────────────────────────────────
function SortIcon({ column }) {
  const sorted = column.getIsSorted();
  if (sorted === "asc")  return <ChevronUp   className="w-3.5 h-3.5 text-primary-600" />;
  if (sorted === "desc") return <ChevronDown className="w-3.5 h-3.5 text-primary-600" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-surface-300 group-hover:text-surface-500" />;
}

// ── Row actions ────────────────────────────────────────────────────────────────
function RowActions({ row, onEdit, onDelete, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const emp = row.original;
  return (
    <div className="relative flex items-center justify-end">
      <button
        onClick={() => setOpen((p) => !p)}
        className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-xl border border-surface-200 shadow-xl overflow-hidden">
            <button
              onClick={() => { onEdit(emp); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-surface-700 hover:bg-surface-50 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-surface-400" /> Edit Employee
            </button>
            <button
              onClick={() => { onStatusChange(emp.id, emp.status === "Active" ? "On Leave" : "Active"); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-surface-700 hover:bg-surface-50 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-warning-500" />
              {emp.status === "Active" ? "Mark On Leave" : "Set Active"}
            </button>
            <div className="border-t border-surface-100" />
            <button
              onClick={() => { onDelete(emp.id); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-danger-600 hover:bg-danger-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove Employee
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main EmployeeTable ─────────────────────────────────────────────────────────
export default function EmployeeTable({ employees, globalFilterOverride = "", onAdd, onEdit, onDelete, onStatusChange }) {
  const [globalFilter,     setGlobalFilter]     = useState(globalFilterOverride || "");
  const [deptFilter,       setDeptFilter]        = useState("all");
  const [statusFilter,     setStatusFilter]      = useState("all");
  const [sorting,          setSorting]           = useState([]);
  const [pagination,       setPagination]        = useState({ pageIndex: 0, pageSize: 8 });

  // Sync topbar search into table filter
  useEffect(() => { setGlobalFilter(globalFilterOverride || ""); }, [globalFilterOverride]);

  // ── Column definitions ────────────────────────────────────────────────────
  const columns = useMemo(() => [
    colHelper.display({
      id: "employee",
      header: "Employee",
      cell: (info) => <Avatar row={info.row} />,
      enableSorting: false,
    }),
    colHelper.accessor("department", {
      header: "Department",
      cell: (info) => (
        <span className="text-sm text-surface-700">{info.getValue()}</span>
      ),
    }),
    colHelper.accessor("role", {
      header: "Role",
      cell: (info) => <RoleBadge value={info.getValue()} />,
    }),
    colHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge value={info.getValue()} />,
    }),
    colHelper.display({
      id: "shift",
      header: "Shift",
      cell: (info) => <ShiftCell row={info.row} />,
      enableSorting: false,
    }),
    colHelper.accessor("joined", {
      header: "Joined",
      cell: (info) => (
        <span className="text-xs text-surface-500">
          {new Date(info.getValue()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    }),
    colHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <RowActions
          row={info.row}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ),
      enableSorting: false,
    }),
  ], [onEdit, onDelete, onStatusChange]);

  // ── Pre-filter by dept + status selects ───────────────────────────────────
  const filteredData = useMemo(() => {
    return employees.filter((e) => {
      if (deptFilter   !== "all" && e.department !== deptFilter)  return false;
      if (statusFilter !== "all" && e.status     !== statusFilter) return false;
      return true;
    });
  }, [employees, deptFilter, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state:       { sorting, globalFilter, pagination },
    onSortingChange:       setSorting,
    onGlobalFilterChange:  setGlobalFilter,
    onPaginationChange:    setPagination,
    getCoreRowModel:       getCoreRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn:        "includesString",
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows  = table.getFilteredRowModel().rows.length;
  const startRow   = pageIndex * pageSize + 1;
  const endRow     = Math.min(startRow + pageSize - 1, totalRows);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search by name, email, role…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500 transition-colors shadow-sm"
          />
        </div>

        {/* Dept filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-400 shrink-0" />
          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPagination((p) => ({ ...p, pageIndex: 0 })); }}
            className="py-2.5 pl-3 pr-8 rounded-xl text-sm border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500 appearance-none shadow-sm"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPagination((p) => ({ ...p, pageIndex: 0 })); }}
          className="py-2.5 pl-3 pr-8 rounded-xl text-sm border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500 appearance-none shadow-sm"
        >
          <option value="all">All Statuses</option>
          {["Active","On Leave","Inactive","Probation"].map((s) => <option key={s}>{s}</option>)}
        </select>

        {/* Add button */}
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-surface-200 bg-surface-50">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-surface-500 select-none ${header.column.getCanSort() ? "cursor-pointer group" : ""}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <SortIcon column={header.column} />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-surface-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center text-surface-400 text-sm">
                    No employees match your filters.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-surface-50 transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 bg-surface-50">
          <p className="text-xs text-surface-500">
            {totalRows === 0
              ? "No results"
              : `Showing ${startRow}–${endRow} of ${totalRows} employees`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed text-surface-600 transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed text-surface-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {/* Page numbers */}
            {Array.from({ length: table.getPageCount() }, (_, i) => i).slice(
              Math.max(0, pageIndex - 2), Math.min(table.getPageCount(), pageIndex + 3)
            ).map((pg) => (
              <button
                key={pg}
                onClick={() => table.setPageIndex(pg)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${pg === pageIndex ? "bg-primary-600 text-white" : "hover:bg-surface-200 text-surface-600"}`}
              >
                {pg + 1}
              </button>
            ))}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed text-surface-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed text-surface-600 transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
