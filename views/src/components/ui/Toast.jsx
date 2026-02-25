// Simple auto-dismissing toast notification
import { useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

const STYLES = {
  success: {
    bg:     "bg-success-50 border-success-200",
    icon:   "text-success-600",
    text:   "text-success-800",
    Icon:   CheckCircle2,
  },
  error: {
    bg:     "bg-red-50 border-red-200",
    icon:   "text-red-600",
    text:   "text-red-800",
    Icon:   XCircle,
  },
  info: {
    bg:     "bg-primary-50 border-primary-200",
    icon:   "text-primary-600",
    text:   "text-primary-800",
    Icon:   AlertCircle,
  },
};

/**
 * @param {{ toast: { type: "success"|"error"|"info", message: string } | null, onClose: () => void }} props
 */
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const s = STYLES[toast.type] ?? STYLES.info;
  const { Icon } = s;

  return (
    <div
      className={`
        fixed top-6 right-6 z-[9999]
        flex items-start gap-3 px-4 py-3
        rounded-xl border shadow-lg
        animate-fade-in
        ${s.bg}
      `}
      style={{ minWidth: 280, maxWidth: 400 }}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${s.icon}`} />
      <p className={`text-sm font-medium flex-1 ${s.text}`}>{toast.message}</p>
      <button
        onClick={onClose}
        className={`shrink-0 p-0.5 rounded hover:opacity-70 transition-opacity ${s.icon}`}
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
