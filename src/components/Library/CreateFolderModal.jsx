//components/library/CreateFolderModal.jsx
"use client";

import React, { useEffect, useState } from "react";
import { FiFolderPlus, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";

import {
  createVideoFolder,
  updateVideoFolder,
} from "@/services/videoFolder.service";

import useFolderStore from "@/store/useFolderStore";

function CreateFolderModal({
  open,
  onClose,
  editFolder = null,
    onSuccess,
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Zustand store action
  const { addFolder } = useFolderStore();

  // SET EDIT DATA
  useEffect(() => {
    if (editFolder) {
      setName(editFolder.name || "");
    } else {
      setName("");
    }
  }, [editFolder, open]);

  const resetForm = () => {
    setName("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Folder name is required");
      return;
    }

    try {
      setLoading(true);

      let response;

      // CREATE
      if (!editFolder) {
        response = await createVideoFolder({
          name: name.trim(),
          parentId: null,
        });

        // 🔥 instant update in UI
        const newFolder = response?.data || response;
        addFolder(newFolder);

        toast.success("Folder created successfully");
      }

      // UPDATE
      else {
        response = await updateVideoFolder({
          videoFolderId: editFolder.id,
          name: name.trim(),
          parentId: null,
        });

        toast.success("Folder updated successfully");
      }

      console.log("FOLDER RESPONSE:", response);

      resetForm();
       onSuccess?.(); 
      onClose();

    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="border-b border-gray-200 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1F304A]">
              {editFolder ? "Edit Folder" : "Create Folder"}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Organize your videos
            </p>
          </div>

          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 text-2xl text-gray-500"
          >
            ×
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6">

          {/* INPUT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Folder Name
            </label>

            <input
              type="text"
              placeholder="Enter folder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 border border-gray-300 rounded-xl px-4 outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 mt-6">

            <button
              type="button"
              onClick={handleClose}
              className="h-11 px-5 rounded-xl border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-11 px-6 rounded-xl bg-[#2563EB] text-white flex items-center gap-2"
            >
              {loading ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiFolderPlus />
              )}

              {editFolder ? "Update Folder" : "Create Folder"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default CreateFolderModal;