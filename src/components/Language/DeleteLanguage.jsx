"use client";

import React from "react";

export default function DeleteLanguageModal({
  isOpen,
  item,
  onCancel,
  onConfirm,
  loading = false,
}) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-[24px] bg-white p-8 shadow-2xl">
        <h2 className="mb-3 text-[20px] font-semibold text-[#1f304a]">
          Confirm Delete
        </h2>

        <p className="text-sm leading-6 text-slate-600">
          Are you sure you want to delete{" "}
          <strong className="text-slate-900">{item.name}</strong>?
          This action cannot be undone.
        </p>

        <div className="mt-7 flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-1/2 rounded-xl bg-gray-200 py-3 font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-1/2 rounded-xl bg-red-600 py-3 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
