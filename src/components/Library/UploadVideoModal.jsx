//components/library/UploadVideoModal.jsx
"use client";

import React, { useEffect, useState } from "react";
import { FiUpload, FiVideo, FiImage } from "react-icons/fi";
import toast from "react-hot-toast";

import useFolderStore from "@/store/useFolderStore";



import {
  uploadVideoWithThumbnail,
  pollVideoStatusUntilReady,
} from "@/services/video.service";

function UploadVideoModal({ open, onClose, onUploaded }) {

  // ✅ Zustand store
  const { folders, fetchFolders } = useFolderStore();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    purpose: "LESSON",
    title: "",
    description: "",
    folderId: "",
    videoFile: null,
    thumbnailFile: null,
  });

  console.log("STATE:", folders);

  // ✅ FETCH FOLDERS FROM ZUSTAND ONLY
  useEffect(() => {
    if (open) {
      fetchFolders();
    }
  }, [open]);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // FILE HANDLERS
  // =========================
  const handleVideoChange = (e) => {
    setFormData({
      ...formData,
      videoFile: e.target.files[0],
    });
  };

  const handleThumbnailChange = (e) => {
    setFormData({
      ...formData,
      thumbnailFile: e.target.files[0],
    });
  };

  // =========================
  // RESET
  // =========================
  const resetForm = () => {
    setFormData({
      purpose: "LESSON",
      title: "",
      description: "",
      folderId: "",
      videoFile: null,
      thumbnailFile: null,
    });

    setProgress(0);
  };

  // =========================
  // SUBMIT
  // =========================
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.folderId) {
    toast.error("Please select a folder");
    return;
  }

  try {
    setLoading(true);

    const { videoAssetId } = await uploadVideoWithThumbnail({
      purpose: formData.purpose,
      title: formData.title,
      description: formData.description,
      folderId: formData.folderId,
      videoFile: formData.videoFile,
      thumbnailFile: formData.thumbnailFile,
      onProgress: (percent) => setProgress(percent),
    });

    toast.success("Video uploaded. Processing in the background...");

    // Close the modal immediately — admin can keep working.
    // The library list will show the new card with a PROCESSING badge.
    resetForm();
    onUploaded?.();
    onClose();

    if (!videoAssetId) return;

    // Fire-and-forget background poll. When status lands on READY (or FAILED),
    // refresh the library again so the badge updates.
    pollVideoStatusUntilReady(videoAssetId).then((result) => {
      if (result.success) {
        toast.success("Video is ready for playback");
        onUploaded?.();
      } else if (result.status === "FAILED") {
        toast.error("Video processing failed");
        onUploaded?.();
      } else if (result.status === "TIMEOUT") {
        toast.error(
          "Video is still processing. Refresh the library to check status."
        );
      }
    });
  } catch (error) {
    console.error(error);
    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        "Upload failed"
    );
  } finally {
    setLoading(false);
  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

          <div>
            <h2 className="text-2xl font-bold text-[#1F304A]">
              Upload Video
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Add videos to VK's Library
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 text-2xl text-gray-500"
          >
            ×
          </button>

        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT */}
            <div className="space-y-4">

              {/* PURPOSE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>

                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full h-11 border border-gray-300 rounded-xl px-4"
                >
                  <option value="LESSON">LESSON</option>
                  <option value="PROMO">PROMO</option>
                </select>
              </div>

              {/* TITLE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full h-11 border border-gray-300 rounded-xl px-4"
                  required
                />
              </div>

              {/* FOLDER */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Folder
                </label>

                <select
                  name="folderId"
                  value={formData.folderId}
                  onChange={handleChange}
                  className="w-full h-11 border border-gray-300 rounded-xl px-4"
                  required
                >
                  <option value="">Select Folder</option>

                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>

                <textarea
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 resize-none"
                  required
                />
              </div>

            </div>

            {/* RIGHT */}
            <div className="space-y-4">

              {/* VIDEO */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Video
                </label>

                <label className="border-2 border-dashed border-gray-300 rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer bg-[#FAFBFD] px-4 overflow-hidden">
                  <FiVideo className="text-4xl text-[#2563EB]" />
                  <p className="mt-2 text-sm">Choose Video</p>

                  {formData.videoFile && (
                    <p
                      className="text-xs text-[#2563EB] mt-1 max-w-full truncate"
                      title={formData.videoFile.name}
                    >
                      {formData.videoFile.name}
                    </p>
                  )}

                  <input
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={handleVideoChange}
                    required
                  />
                </label>
              </div>

              {/* THUMBNAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Thumbnail
                </label>

                <label className="border-2 border-dashed border-gray-300 rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer bg-[#FAFBFD] px-4 overflow-hidden">
                  <FiImage className="text-4xl text-[#2563EB]" />
                  <p className="mt-2 text-sm">Choose Image</p>

                  {formData.thumbnailFile && (
                    <p
                      className="text-xs text-[#2563EB] mt-1 max-w-full truncate"
                      title={formData.thumbnailFile.name}
                    >
                      {formData.thumbnailFile.name}
                    </p>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleThumbnailChange}
                    required
                  />
                </label>
              </div>

            </div>

          </div>

          {/* PROGRESS */}
          {loading && (
            <div className="mt-6">
              <div className="w-full h-3 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-[#2563EB]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-sm text-gray-500 mt-2">
                Uploading... {progress}%
              </p>
            </div>
          )}

          {/* FOOTER */}
          <div className="flex justify-end gap-3 mt-6">

            <button
              type="button"
              onClick={onClose}
              className="h-11 px-6 border border-gray-300 rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-11 px-6 bg-[#2563EB] text-white rounded-xl"
            >
              {loading ? "Uploading..." : "Upload Video"}
            </button>

          </div>

        </form>
      </div>

    </div>
  );
}

export default UploadVideoModal;