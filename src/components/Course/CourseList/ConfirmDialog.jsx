"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const TONES = {
  danger: "bg-red-600 hover:bg-red-700 focus-visible:ring-red-300",
  primary: "bg-[#1F304A] hover:bg-[#2B4162] focus-visible:ring-[#8BA8D4]",
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  busyLabel = "Working…",
  tone = "primary",
  icon: Icon,
  busy = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[2px]"
      onMouseDown={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          {Icon && (
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                tone === "danger"
                  ? "bg-red-50 text-red-600"
                  : "bg-[#E3EAF8] text-[#1F304A]"
              }`}
            >
              <Icon size={20} />
            </div>
          )}
          <div className="min-w-0">
            <h2
              id="confirm-dialog-title"
              className="text-base font-semibold text-slate-900"
            >
              {title}
            </h2>
            <div className="mt-1.5 text-sm leading-6 text-slate-600">
              {description}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-70 ${TONES[tone]}`}
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
