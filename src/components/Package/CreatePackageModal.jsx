"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useCategoryStore from "@/store/categoryStore";

export default function CreateCategoryModal({ onClose }) {
  const { categories, fetchCategories, createCategory, loading } =
    useCategoryStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const PACKAGE_NAME_MAX = 50;

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Package name is required");
      return;
    }
    if (trimmedName.length > PACKAGE_NAME_MAX) {
      toast.error(`Package name must be ${PACKAGE_NAME_MAX} characters or fewer`);
      return;
    }

    // ✅ ONLY send required fields
    const payload = {
      name: trimmedName,
    };

    // ✅ Add optional fields ONLY if they exist
    if (description.trim()) payload.description = description.trim();
    if (icon.trim()) payload.icon = icon.trim();
    if (parentId) payload.parentId = parentId;

    try {
      await createCategory(payload);
      toast.success("Category created successfully");
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create category",
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl w-[450px] shadow-xl">
        <h2 className="text-[22px] text-[#1f285b] font-semibold mb-6">Create New Package</h2>

        {/* Category Name */}
        <label className="text-sm font-semibold text-[#5d5d5d]">
          Package Name *
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={PACKAGE_NAME_MAX}
          className="w-full border border-[#606060] px-4 py-3 rounded-lg mt-1 outline-none"
          placeholder="e.g. Competitive Exams"
        />
        <p className="text-xs text-gray-500 mt-1">
          {name.length}/{PACKAGE_NAME_MAX} characters
        </p>


        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="w-1/2 py-3 bg-[#99a1af] text-white rounded-lg
             hover:bg-[#8b93a1] transition-colors duration-200"

            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-1/2 py-3 bg-[#1f285b] text-white rounded-lg
             hover:bg-[#2a3470] transition-colors duration-200
             disabled:opacity-60 disabled:hover:bg-[#1f285b]"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
