"use client";
import React from "react";

export default function EditPackage({
  isOpen,
  isEdit,
  value,
  title,
  onChange,
  onCancel,
  onSubmit,
}) {
  if (!isOpen) return null;

  const PACKAGE_NAME_MAX = 50;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-[420px]">
        <h2 className="text-[22px] mb-2">{title}</h2>

        <p className="text-[#5d5d5d] font-semibold mb-1">Name of package</p>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={PACKAGE_NAME_MAX}
          className="w-full border px-4 py-3 rounded-lg outline-none"
          placeholder="Package name"
        />
        <p className="text-xs text-gray-500 mt-1">
          {(value || "").length}/{PACKAGE_NAME_MAX} characters
        </p>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onCancel}
            className="w-1/2 py-3 bg-gray-400 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="w-1/2 py-3 bg-[#5d5d5d] text-white rounded-lg"
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
