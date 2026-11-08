"use client";

import { ChevronDown, Globe2, Loader2 } from "lucide-react";

export const GLOBAL_SCOPE = "__global__";

/**
 * Scope picker for course ordering. Values are language UUIDs, or
 * GLOBAL_SCOPE for the all-languages order. Names are display-only.
 *
 * @param {{
 *   languages: {id: string, name: string, isActive?: boolean}[],
 *   value: string,
 *   onChange: (value: string) => void,
 *   disabled?: boolean,
 *   loading?: boolean,
 * }} props
 */
export default function LanguageSelect({
  languages,
  value,
  onChange,
  disabled = false,
  loading = false,
}) {
  return (
    <div className="relative w-full sm:w-56">
      <label htmlFor="order-language" className="sr-only">
        Language
      </label>
      <Globe2
        size={14}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <select
        id="order-language"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-8 w-full appearance-none rounded-md border border-slate-200 bg-white pl-8 pr-8 text-xs font-medium capitalize text-slate-800 shadow-sm outline-none transition focus:border-[#8BA8D4] focus:ring-2 focus:ring-[#8BA8D4]/30 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
      >
        <option value={GLOBAL_SCOPE}>All languages (global order)</option>
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
            {lang.isActive === false ? " (inactive)" : ""}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <ChevronDown size={14} />
        )}
      </span>
    </div>
  );
}
