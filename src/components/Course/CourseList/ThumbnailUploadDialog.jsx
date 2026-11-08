"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ImageIcon, ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import { uploadImageToCloudinary } from "@/utils/cloudinaryImageUpload";
import useCourseStore from "@/store/useCourseStore";
import { getCourseByIdApi } from "@/services/coursesApi";
import { getApiErrorMessage } from "./courseStatus";

/**
 * Replaces a course thumbnail in two steps:
 *   1. signed upload to Cloudinary (with progress)
 *   2. PUT /courses/:id { thumbnail }
 * The existing thumbnail is left untouched unless BOTH steps succeed.
 */
// onSaved (optional): called with (courseId, url) after the backend confirms.
export default function ThumbnailUploadDialog({ course, onClose, onSaved }) {
  const updateCourseThumbnail = useCourseStore((s) => s.updateCourseThumbnail);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | uploading | saving
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  // Reuse an uploaded URL if only the course update failed, so a retry
  // doesn't upload the same file twice.
  const uploadedRef = useRef({ file: null, url: "" });

  const busy = phase !== "idle";

  // The general course list has no `thumbnail` field, so load it from the
  // course detail endpoint when it wasn't passed in.
  const hasThumbField = Object.prototype.hasOwnProperty.call(course, "thumbnail");
  const [currentThumb, setCurrentThumb] = useState(course.thumbnail || "");
  const [currentLoading, setCurrentLoading] = useState(!hasThumbField);

  useEffect(() => {
    if (hasThumbField) return;
    let cancelled = false;
    getCourseByIdApi(course.id)
      .then((res) => {
        if (!cancelled) setCurrentThumb(res?.data?.data?.thumbnail || "");
      })
      .catch(() => {})
      .finally(() => !cancelled && setCurrentLoading(false));
    return () => {
      cancelled = true;
    };
  }, [course.id, hasThumbField]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const pickFile = (picked) => {
    if (!picked) return;
    if (!picked.type?.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError("");
    setProgress(0);
    setFile(picked);
  };

  const handleSave = async () => {
    if (!file || busy) return;
    setError("");

    let url = uploadedRef.current.file === file ? uploadedRef.current.url : "";

    try {
      if (!url) {
        setPhase("uploading");
        setProgress(0);
        url = await uploadImageToCloudinary(file, "COURSE_THUMBNAIL", {
          onProgress: setProgress,
        });
        if (!url) throw new Error("Cloudinary did not return an image URL");
        uploadedRef.current = { file, url };
      }

      setPhase("saving");
      await updateCourseThumbnail(course.id, url);
      onSaved?.(course.id, url);

      toast.success("Thumbnail updated");
      onClose();
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to update thumbnail");
      setError(message);
      toast.error(message);
      setPhase("idle");
    }
  };

  const statusText =
    phase === "uploading"
      ? `Uploading… ${progress}%`
      : phase === "saving"
        ? "Saving to course…"
        : "";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[2px]"
      onMouseDown={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="thumb-dialog-title"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="min-w-0">
            <h2
              id="thumb-dialog-title"
              className="text-base font-semibold text-slate-900"
            >
              Change thumbnail
            </h2>
            <p className="truncate text-sm text-slate-500">{course.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 py-5">
          {/* Current */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Current
            </p>
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {currentLoading ? (
                <Loader2 size={20} className="animate-spin text-slate-300" />
              ) : currentThumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentThumb}
                  alt={`Current thumbnail for ${course.title}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon size={28} className="text-slate-300" />
              )}
            </div>
          </div>

          {/* New */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              New
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!busy) pickFile(e.dataTransfer.files?.[0]);
              }}
              className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white text-slate-500 transition hover:border-[#8BA8D4] hover:bg-[#F5F8FD] disabled:cursor-not-allowed"
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="New thumbnail preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex flex-col items-center gap-1.5 text-xs">
                  <ImagePlus size={22} />
                  Choose image
                </span>
              )}

              {busy && (
                <span className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-200">
                  <span
                    className="block h-full bg-[#1F304A] transition-[width]"
                    style={{ width: phase === "saving" ? "100%" : `${progress}%` }}
                  />
                </span>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                pickFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        <div className="px-6">
          {error ? (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error} The current thumbnail was kept.
            </p>
          ) : (
            <p className="text-xs text-slate-500" aria-live="polite">
              {statusText ||
                (file
                  ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : "The current thumbnail stays until the new one is saved.")}
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!file || busy}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1F304A] px-4 py-2 text-sm font-medium text-white hover:bg-[#2B4162] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {phase === "uploading"
              ? `Uploading ${progress}%`
              : phase === "saving"
                ? "Saving…"
                : "Upload & save"}
          </button>
        </div>
      </div>
    </div>
  );
}
