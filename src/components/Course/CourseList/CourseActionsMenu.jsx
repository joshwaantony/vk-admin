"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

/**
 * items: [{ key, label, icon, onClick, disabled, hint, danger, divider }]
 */
export default function CourseActionsMenu({ items, disabled = false, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 bottom-full z-30 mb-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
        >
          {items.map((item) =>
            item.divider ? (
              <div key={item.key} className="my-1.5 h-px bg-slate-100" />
            ) : (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                title={item.disabled ? item.hint : undefined}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition disabled:cursor-not-allowed ${
                  item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-700 hover:bg-slate-50"
                } disabled:text-slate-400 disabled:hover:bg-transparent`}
              >
                {item.icon && <item.icon size={16} className="shrink-0" />}
                <span className="flex-1">{item.label}</span>
                {item.disabled && item.hint && (
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Soon
                  </span>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
