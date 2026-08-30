"use client";
import React from "react";

export default function DeletePackageModal({
  isOpen,
  item,
  onCancel,
  onConfirm,
}) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-[420px]">
        <h2 className="text-[20px] font-semibold mb-4">Confirm Delete</h2>

        <p>
          Are you sure you want to delete{" "}
          <strong>{item.name}</strong>
          {item.children?.length > 0 &&
            ` and its ${item.children.length} sub-package(s)`}?
        </p>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onCancel}
            className="w-1/2 py-3 bg-gray-400 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-1/2 py-3 bg-red-600 text-white rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
