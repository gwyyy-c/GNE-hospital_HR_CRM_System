// src/components/Doctor/NotificationCenter.jsx
import { useState } from "react";
import {
  Bell, X, CheckCheck, BedDouble, LogOut,
  FlaskConical, Stethoscope, Clock,
} from "lucide-react";

const TYPE_META = {
  inpatient_request: { icon: BedDouble,    color: "bg-danger-500",  text: "Admission Request",  ring: "ring-danger-200"  },
  discharge_ready:   { icon: LogOut,       color: "bg-success-500", text: "Discharge Ready",    ring: "ring-success-200" },
  lab_result:        { icon: FlaskConical, color: "bg-violet-500",  text: "Lab Result",         ring: "ring-violet-200"  },
  consult_complete:  { icon: Stethoscope,  color: "bg-primary-500", text: "Consult Complete",   ring: "ring-primary-200" },
};

function timeAgo(iso) {
  const d = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (d < 60)  return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d/60)}m ago`;
  return `${Math.floor(d/3600)}h ago`;
}

function NotifItem({ notif, onDismiss }) {
  const meta = TYPE_META[notif.type] ?? TYPE_META.consult_complete;
  const Icon = meta.icon;

  return (
    <div className={`
      group relative flex items-start gap-3 p-3.5 rounded-xl border transition-all
      ${!notif.read ? "bg-white border-surface-200 shadow-sm" : "bg-surface-50 border-surface-100"}
    `}>
      {/* Unread dot */}
      {!notif.read && (
        <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-primary-500" />
      )}

      <div className={`w-8 h-8 rounded-xl ${meta.color} flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <p className={`text-xs font-bold ${!notif.read ? "text-surface-900" : "text-surface-600"} leading-tight`}>
          {notif.title}
        </p>
        <p className="text-[11px] text-surface-500 mt-0.5 line-clamp-2">{notif.body}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${meta.color} text-white`}>
            {meta.text}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-surface-400">
            <Clock className="w-2.5 h-2.5" />
            {timeAgo(notif.timestamp)}
          </span>
        </div>
      </div>

      <button
        onClick={() => onDismiss(notif.id)}
        className="absolute top-2.5 right-7 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-surface-200 text-surface-400 transition-all"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function NotificationCenter({ notifications, unreadCount, onMarkAllRead, onDismiss }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-surface-200 hover:bg-surface-50 hover:border-surface-300 shadow-card transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5 text-surface-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-30 w-80 bg-white rounded-2xl border border-surface-200 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 bg-surface-50">
              <div>
                <p className="text-sm font-bold text-surface-900">Notifications</p>
                {unreadCount > 0 && (
                  <p className="text-[11px] text-danger-600 font-semibold">{unreadCount} unread</p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-semibold"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1.5">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell className="w-8 h-8 text-surface-200 mb-2" />
                  <p className="text-sm text-surface-400 font-medium">No notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <NotifItem key={n.id} notif={n} onDismiss={onDismiss} />
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-surface-200 bg-surface-50">
                <p className="text-[11px] text-surface-400 text-center">
                  Inpatient requests are forwarded to the Front Desk queue
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}