//components/SectionCard.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { FaCircleMinus, FaPen } from "react-icons/fa6";
import { GoPlus } from "react-icons/go";
import { LiaSave } from "react-icons/lia";
import { MdDelete } from "react-icons/md";
import useSectionStore from "@/store/useSectionStore";

export default function SectionCard({
  sectionId,
  title,
  isOpen,
  onToggle,
  onDelete,
  children,
  actionsDisabled = false,
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [sectionTitle, setSectionTitle] = useState(title || "");
  const [deleting, setDeleting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [sectionData, setSectionData] = useState(null);

  const { updateSection, deleteSection, getSectionById } = useSectionStore();

  useEffect(() => {
    const fetchSection = async () => {
      if (!sectionId) return;

      try {
        setFetching(true);

        const data = await getSectionById(sectionId);

        setSectionData(data);
        setSectionTitle(data?.title || "");
      } catch (error) {
        console.error("Fetch section failed:", error);
        toast.error("Failed to fetch section");
      } finally {
        setFetching(false);
      }
    };

    fetchSection();
  }, [sectionId, getSectionById]);

  const inputRef = useRef(null);

  useEffect(() => {
  // Auto-focus the input when entering edit mode
  if (editingTitle) {
    inputRef.current?.focus();
  }
}, [editingTitle]);

const displayTitle = sectionData?.title || title || "";

const handleStartEdit = () => {
  if (actionsDisabled) return;
  setSectionTitle(displayTitle);
  setEditingTitle(true);
};

const handleCancelEdit = () => {
  setSectionTitle(displayTitle);
  setEditingTitle(false);
};


  const handleUpdateSectionTitle = async () => {
    if (actionsDisabled) {
      toast.error("Please wait until the video upload is completed");
      return;
    }

    if (!sectionTitle.trim()) {
      toast.error("Section title cannot be empty");
      return;
    }

    const toastId = toast.loading("Updating section...");

    try {
      const updatedData = await updateSection({
        sectionId,
        title: sectionTitle,
      });

      setSectionData((prev) => ({
        ...prev,
        ...updatedData,
        title: sectionTitle,
      }));

      toast.success("Section title updated", { id: toastId });
      setEditingTitle(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update section", { id: toastId });
    }
  };

  const handleDeleteSection = async () => {
    if (deleting || actionsDisabled) return;

    const confirmDelete = confirm(
      "Are you sure you want to delete this section?"
    );

    if (!confirmDelete) return;

    const toastId = toast.loading("Deleting section...");

    try {
      setDeleting(true);

      await deleteSection(sectionId);

      toast.success("Section deleted", { id: toastId });
      onDelete?.(sectionId);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete section", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-gray-100 p-4 shadow-md sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3 border-b pb-2">
  <div className="flex flex-1 items-center gap-3">
    {fetching ? (
      <span className="text-sm text-gray-500">Loading section...</span>
    ) : (
      <>
        <label htmlFor={`section-title-${sectionId}`} className="sr-only">
          Section title
        </label>
        <input
          ref={inputRef}
          id={`section-title-${sectionId}`}
          name="sectionTitle"
          type="text"
          disabled={!editingTitle}
          value={editingTitle ? sectionTitle : displayTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && editingTitle) handleUpdateSectionTitle();
            if (e.key === "Escape" && editingTitle) handleCancelEdit();
          }}
          placeholder="Section title"
          className="flex-1 border-b-2 border-gray-300 bg-transparent px-4 py-2 text-[#1F304A] outline-none disabled:cursor-default disabled:text-[#1F304A] disabled:opacity-100"
        />
      </>
    )}
  </div>

  {!fetching && (
    <div className="flex items-center gap-3">
      {editingTitle ? (
        <>
          <button
            type="button"
            onClick={handleUpdateSectionTitle}
            disabled={actionsDisabled}
            className="rounded-lg bg-gray-700 px-5 py-2 text-sm text-white disabled:opacity-50"
          >
            Update
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            disabled={actionsDisabled}
            className="rounded-lg border-2 border-[#1F304A] px-5 py-2 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={handleStartEdit}
            disabled={actionsDisabled}
            className="flex items-center gap-1 rounded border border-blue-600 px-3 py-1 text-sm text-blue-600 disabled:opacity-50"
          >
            <FaPen />
            Edit
          </button>

          <button
            type="button"
            onClick={handleDeleteSection}
            disabled={deleting || actionsDisabled}
            className="flex items-center gap-1 rounded border border-red-600 px-3 py-1 text-sm text-red-600 disabled:opacity-50"
          >
            <MdDelete />
            {deleting ? "Deleting..." : "Delete"}
          </button>

          <button
            type="button"
            onClick={onToggle}
            disabled={actionsDisabled}
            className="text-[26px] text-gray-400 disabled:opacity-50"
          >
            {isOpen ? <FaCircleMinus /> : <GoPlus />}
          </button>
        </>
      )}
    </div>
  )}
</div>

      {isOpen && children}
    </div>
  );
}
