//components/PromoVideoSection.jsx
"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { FaCircleMinus } from "react-icons/fa6";
import { FaPen } from "react-icons/fa";
import { GoPlus } from "react-icons/go";
import { GrGallery } from "react-icons/gr";
import toast from "react-hot-toast";
import { MdOutlineFileUpload } from "react-icons/md";
import { LiaSave } from "react-icons/lia";

import {
  initiateVideoUpload,
  getVideoStatusApi,
  pollVideoStatusUntilReady as pollVideoStatus,
} from "@/services/video.service";
import { uploadToVimeo } from "@/utils/vimeoUpload";
import { uploadImageToCloudinary } from "@/utils/cloudinaryImageUpload";
import useCourseStore from "@/store/useCourseStore";
import usePromoStore from "@/store/usePromoStore";
import VideoSourceModal from "@/components/VideoSourceModal";

function PromoVideoSection({ promoId = null, moduleBusy = false, onUnsavedChange }, ref) {
  const { courseId, replacePromoVideo, currentCourse } = useCourseStore();
  const { fetchPromoById, savePromo, updatePromo, removePromo, loading } = usePromoStore();

  const [isOpen, setIsOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const [videoName, setVideoName] = useState("");
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [videoAssetId, setVideoAssetId] = useState(null);
  const [videoProvider, setVideoProvider] = useState(null);

  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);
  const [thumbnailName, setThumbnailName] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [existingPromoId, setExistingPromoId] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null);
  const [pollingStatus, setPollingStatus] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // ⬇️ NEW: library chooser modal state
  const [openVideoSourceModal, setOpenVideoSourceModal] = useState(false);

  const videoBusy = uploading || pollingStatus || checkingStatus;
  const actionsLocked = videoBusy || moduleBusy || thumbnailUploading || saving;
  const titleInputId = "promo-video-title";
  const descriptionInputId = "promo-video-description";
  const videoInputId = "promo-video-file";
  const thumbnailInputId = "promo-thumbnail-file";

  /* ================= PREFILL ON EDIT ================= */
  useEffect(() => {
    const promo = currentCourse?.promos?.[0];
    if (!promo) return;

    setExistingPromoId(promo.id);
    setTitle(promo.title || "");
    setDescription(promo.description || "");
    setThumbnailUrl(promo.imageUrl || "");
    setVideoAssetId(promo.videoAssetId || null);
    setVideoProvider(promo.videoProvider || null);
    setVideoName(promo.videoAssetId ? promo.videoAssetId : "");
    setVideoStatus(promo.videoAssetId ? "READY" : null);
    setProgress(promo.videoAssetId ? 100 : 0);
    setIsSaved(true);
  }, [currentCourse]);

  const fileRef = useRef(null);
  const thumbRef = useRef(null);
  const pollCancelledRef = useRef(false);

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    video: "",
    thumbnail: "",
  });
  // ⬇️ NEW: cancel any in-flight polling on unmount

  useEffect(() => {
    return () => {
      pollCancelledRef.current = true;
    };
  }, []);

  // Report unsaved-dirty state to parent so Finish can block on it.
  const hasDirtyPromoData =
    !isSaved &&
    Boolean(
      videoAssetId ||
        thumbnailUrl ||
        title.trim() ||
        description.trim() ||
        selectedVideoFile ||
        selectedThumbnailFile,
    );
  useEffect(() => {
    onUnsavedChange?.(hasDirtyPromoData);
  }, [hasDirtyPromoData, onUnsavedChange]);
  useEffect(() => {
    const loadPromo = async () => {
      if (!promoId) return;

      const promo = await fetchPromoById(promoId);

      if (!promo) return;

      setExistingPromoId(promo.id || promoId);
      setTitle(promo.title || "");
      setDescription(promo.description || "");
      setVideoAssetId(promo.videoAssetId || null);
      setVideoProvider(promo.videoProvider || null);
      setThumbnailUrl(promo.imageUrl || "");
      setVideoName(promo.videoAssetId || "Uploaded promo video");
      setThumbnailName(promo.imageUrl ? "Uploaded thumbnail" : "");
      setVideoStatus(promo.videoAssetId ? "READY" : null);
      setProgress(promo.videoAssetId ? 100 : 0);
      setIsSaved(true);
    };

    loadPromo();
  }, [promoId, fetchPromoById]);

  const isFormValid = () => {
    return (
      title.trim() &&
      description.trim() &&
      videoAssetId &&
      thumbnailUrl &&
      videoStatus === "READY"
    );
  };

  const handleDelete = async () => {
    if (actionsLocked || deleting) return;

    // Resets the section back to an empty state. Used by both branches.
    const resetSection = () => {
      setExistingPromoId(null);
      setTitle("");
      setDescription("");
      setThumbnailUrl("");
      setThumbnailName("");
      setSelectedThumbnailFile(null);
      setVideoAssetId(null);
      setVideoProvider(null);
      setVideoName("");
      setSelectedVideoFile(null);
      setVideoStatus(null);
      setProgress(0);
      setIsSaved(false);
      setErrors({ title: "", description: "", video: "", thumbnail: "" });
    };

    // Case A: a saved promo exists on the backend — delete it.
    if (existingPromoId) {
      try {
        setDeleting(true);
        const result = await removePromo(existingPromoId);

        if (!result.success) {
          toast.error(result.error || "Failed to delete promo");
          return;
        }

        resetSection();
        setOpenDeleteModal(false);
        toast.success("Promo deleted");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete promo");
      } finally {
        setDeleting(false);
      }
      return;
    }

    // Case B: nothing saved yet — just clear the section locally.
    // The library video stays untouched; we just unhook it from this section.
    resetSection();
    setOpenDeleteModal(false);
    toast.success("Promo cleared");
  };

  const checkVideoStatus = async (id = videoAssetId, showToast = true) => {
    if (!id) return null;

    try {
      setCheckingStatus(true);

      const data = await getVideoStatusApi(id);

      setVideoStatus(data.status);

      if (showToast) {
        if (data.status === "READY") {
          toast.success("Video is ready for playback");
        } else {
          toast.error(`Video is still ${data.status}`);
        }
      }

      return data.status;
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to check video status",
      );
      return null;
    } finally {
      setCheckingStatus(false);
    }
  };

  const pollVideoStatusUntilReady = async (id) => {
    if (!id) return null;

    setPollingStatus(true);
    pollCancelledRef.current = false;

    const result = await pollVideoStatus(id, {
      onStatusChange: (s) => setVideoStatus(s),
      shouldContinue: () => !pollCancelledRef.current,
    });

    setPollingStatus(false);

    if (result.success) {
      toast.success("Video is ready for playback");
      return "READY";
    }
    if (result.status === "FAILED") {
      toast.error("Video processing failed");
      return null;
    }
    if (result.status === "TIMEOUT") {
      toast.error(
        "Video is still processing. Please check again after some time."
      );
      return null;
    }
    if (result.status === "CANCELLED") {
      return null; // silent — caused by unmount
    }
    toast.error("Failed to check video status");
    return null;
  };

  // ⬇️ NEW: handler for when admin picks a video from the library
  const handleLibraryVideoSelect = async (video) => {
    if (actionsLocked || isSaved) return;

    const assetId = video.videoAssetId || video.assetId || video.id;
    const provider = video.provider || video.videoProvider || "VIMEO";

    setVideoAssetId(assetId);
    setVideoProvider(provider);
    setVideoName(video.title || video.name || assetId);
    setSelectedVideoFile(null);
    setProgress(100);
    setVideoStatus("READY");
    setPollingStatus(false);

    if (video.thumbnail || video.imageUrl) {
      setThumbnailUrl(video.thumbnail || video.imageUrl);
      setThumbnailName("Library thumbnail");
      setSelectedThumbnailFile(null);
    }

    setErrors((p) => ({ ...p, video: "" }));

    try {
      if (courseId) {
        await replacePromoVideo(assetId, provider);
      }
      toast.success("Video selected from VK's Library");
    } catch (err) {
      console.error(err);
      toast.error("Failed to attach library video");
    }
  };

  const handleFileSelect = (file) => {
    if (!file || isSaved || actionsLocked) return;

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);

      if (video.duration > 300) {
        setErrors((p) => ({
          ...p,
          video: "Video must be less than or equal to 5 minutes",
        }));
        setSelectedVideoFile(null);
        setVideoName("");
        return;
      }

      setSelectedVideoFile(file);
      setVideoName(file.name);
      setVideoAssetId(null);
      setVideoProvider(null);
      setVideoStatus(null);
      setProgress(0);
      setErrors((p) => ({ ...p, video: "" }));
    };
    video.src = URL.createObjectURL(file);
  };

  const uploadPromo = async () => {
    if (actionsLocked) return;
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!thumbnailUrl) newErrors.thumbnail = "Upload thumbnail before video";
    if (!selectedVideoFile || isSaved) newErrors.video = "Promo video is required";

    if (Object.keys(newErrors).length) {
      setErrors((p) => ({ ...p, ...newErrors }));
      return;
    }

    if (!courseId) {
      toast.error("Course must be created first");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      toast.loading("Uploading video...", { id: "video" });

      const response = await initiateVideoUpload({
        purpose: "PROMO",
        size: selectedVideoFile.size,
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnailUrl,
        folderId: courseId,
      });

      const { uploadUrl, videoAssetId, provider } = response;

      await uploadToVimeo(uploadUrl, selectedVideoFile, setProgress);
      setUploading(false);
      setProgress(100);

      setVideoAssetId(videoAssetId);
      setVideoProvider(provider);
      setSelectedVideoFile(null);
      setVideoStatus("PROCESSING");
      setPollingStatus(true);

      await replacePromoVideo(videoAssetId, provider);

      toast.success("Video uploaded successfully. Processing started.", {
        id: "video",
      });

      await pollVideoStatusUntilReady(videoAssetId);
    } catch (err) {
      console.error(err);
      setPollingStatus(false);
      toast.error("Video upload failed", { id: "video" });
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailSelect = (file) => {
    if (!file || isSaved || actionsLocked) return;
    setSelectedThumbnailFile(file);
    setThumbnailName(file.name);
    setErrors((p) => ({ ...p, thumbnail: "" }));
  };

  const handleThumbnailUpload = async () => {
    if (actionsLocked) {
      toast.error("Please wait until video upload is completed");
      return;
    }

    if (!selectedThumbnailFile || isSaved) {
      setErrors((p) => ({ ...p, thumbnail: "Thumbnail is required" }));
      return;
    }

    try {
      setThumbnailUploading(true);

      toast.loading("Uploading thumbnail...", { id: "thumb" });

      const url = await uploadImageToCloudinary(
        selectedThumbnailFile,
        "PROMO_IMAGE",
      );

      setThumbnailUrl(url);
      setSelectedThumbnailFile(null);

      toast.success("Thumbnail uploaded successfully", { id: "thumb" });
    } catch (err) {
      console.error(err);
      toast.error("Thumbnail upload failed", { id: "thumb" });
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleSave = async () => {
    if (actionsLocked) return false;
    if (isSaved) return true;

    const newErrors = {
      title: "",
      description: "",
      video: "",
      thumbnail: "",
    };

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!videoAssetId) newErrors.video = "Promo video is required";
    if (!thumbnailUrl) newErrors.thumbnail = "Thumbnail is required";

    setErrors(newErrors);
    if (Object.values(newErrors).some((err) => err)) return false;

    const latestStatus = await checkVideoStatus(videoAssetId, false);

    if (latestStatus !== "READY") {
      toast.error(
        "Video is not ready yet. Please check status again after processing.",
      );
      return false;
    }

    try {
      setSaving(true);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        videoAssetId,
        videoProvider,
        imageUrl: thumbnailUrl,
        courseId,
        order: 0,
      };

      let result;

      if (existingPromoId) {
        result = await updatePromo(existingPromoId, payload);
      } else {
        result = await savePromo(payload);
      }

      if (!result.success) {
        toast.error(result.error || "Failed to save promo video");
        return false;
      }

      const savedPromo = result.data;
      setExistingPromoId(savedPromo?.id || existingPromoId);
      setIsSaved(true);

      toast.success(
        existingPromoId
          ? "Promo updated successfully"
          : "Promo saved successfully",
      );
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Failed to save promo video");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Imperative save() — reused by CreateModules' Finish auto-persist loop. Returns
  // true if the promo is already saved or saves successfully; false otherwise.
  useImperativeHandle(ref, () => ({
    save: handleSave,
    isSaved: () => isSaved,
  }));

  const handleEdit = () => {
    if (actionsLocked) return;
    setIsSaved(false);
  };

  return (
    <div className="mt-[10px] mb-4 rounded-lg border border-gray-100 p-5 shadow-md">
      <div className="flex items-center justify-between text-[#1F304A]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Promo video</span>
          <FaPen />
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-2xl text-gray-400 hover:text-gray-700"
        >
          {isOpen ? <FaCircleMinus /> : <GoPlus />}
        </button>
      </div>

      {isOpen && (
        <>
          <div className="mt-2 mb-4 border-b border-gray-400" />

          {loading ? (
            <p className="py-6 text-sm text-gray-500">Loading promo...</p>
          ) : (
            <>
              <div className="flex justify-between gap-6">
                <div className="flex-1">
                  <div className="mb-2 flex gap-4">
                    <div>
                      <label htmlFor={titleInputId} className="sr-only">
                        Promo video title
                      </label>
                      <input
                        id={titleInputId}
                        name="promoTitle"
                        type="text"
                        disabled={isSaved}
                        value={title}
                        maxLength={40}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setErrors((p) => ({ ...p, title: "" }));
                        }}
                        placeholder="Title (limit: 40 characters)"
                        className={`w-[250px] rounded-lg border border-gray-400 p-2 text-gray-600 outline-gray-400 placeholder:text-sm ${errors.title ? "border-red-400" : ""
                          }`}
                      />
                      {errors.title && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.title}
                        </p>
                      )}
                    </div>

                    <div className="flex-1">
                      <label htmlFor={descriptionInputId} className="sr-only">
                        Promo video description
                      </label>
                      <input
                        id={descriptionInputId}
                        name="promoDescription"
                        type="text"
                        disabled={isSaved}
                        value={description}
                        maxLength={130}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          setErrors((p) => ({ ...p, description: "" }));
                        }}
                        placeholder="Description (limit: 130 characters)"
                        className={`w-full rounded-lg border border-gray-400 p-2 text-gray-600 outline-gray-400 placeholder:text-sm ${errors.description ? "border-red-400" : ""
                          }`}
                      />
                      {errors.description && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-[15px] flex items-start gap-6">
                    <div className="flex gap-3">
                      {/* ⬇️ CHANGED: opens chooser modal instead of native file picker */}
                      <div
                        onClick={() =>
                          !actionsLocked && !isSaved && setOpenVideoSourceModal(true)
                        }
                        className="flex h-20 w-24 cursor-pointer items-center justify-center rounded border text-xs text-gray-400"
                      >
                        {videoName ? "Video Selected" : "Select Video"}
                      </div>

                      <div>
                        <p
                          className={`mt-2 max-w-[150px] truncate text-sm ${videoName ? "text-[#1F304A]" : "italic text-gray-400"
                            }`}
                        >
                          {videoName || "No video selected"}
                        </p>

                        <button
                          type="button"
                          disabled={
                            actionsLocked ||
                            isSaved ||
                            !selectedVideoFile ||
                            !title.trim() ||
                            !description.trim() ||
                            !thumbnailUrl
                          }
                          onClick={uploadPromo}
                          className="mt-2 flex items-center justify-center gap-[2px] rounded-[14px] border border-[#37af47] px-2.5 py-0.5 text-[12px] text-[#37af47] shadow-2xl disabled:opacity-60"
                        >
                          <MdOutlineFileUpload />
                          {uploading
                            ? "Uploading..."
                            : pollingStatus
                              ? "Processing..."
                              : videoStatus === "READY"
                                ? "Uploaded"
                                : "Upload"}
                        </button>

                        {errors.video && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.video}
                          </p>
                        )}

                        <label htmlFor={videoInputId} className="sr-only">
                          Promo video file
                        </label>
                        <input
                          id={videoInputId}
                          name="promoVideoFile"
                          ref={fileRef}
                          type="file"
                          accept="video/*"
                          hidden
                          onChange={(e) => handleFileSelect(e.target.files[0])}
                        />
                      </div>
                    </div>

                    <div className="flex-1 text-sm">
                      <p className="mb-2 text-sm text-[#1F304A]">Upload status</p>

                      <div className="pointer-events-none relative h-[4px] w-full overflow-hidden rounded-full bg-gray-300">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full bg-green-500 transition-all duration-300"
                          style={{
                            width: uploading
                              ? `${progress}%`
                              : videoStatus === "READY" || videoAssetId
                                ? "100%"
                                : "0%",
                          }}
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                        <span className="text-gray-500">
                          Video status:{" "}
                          <strong
                            className={
                              videoStatus === "READY"
                                ? "text-green-600"
                                : videoStatus === "PROCESSING"
                                  ? "text-orange-500"
                                  : "text-[#1F304A]"
                            }
                          >
                            {uploading
                              ? `Uploading... ${progress}%`
                              : pollingStatus
                                ? `Checking... ${videoStatus || "PROCESSING"}`
                                : videoStatus || "Not uploaded"}
                          </strong>
                        </span>

                        {videoAssetId && !isSaved && videoStatus !== "READY" && (
                          <button
                            type="button"
                            onClick={() => pollVideoStatusUntilReady(videoAssetId)}
                            disabled={actionsLocked}
                            className="rounded border border-gray-400 px-2 py-1 text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {checkingStatus || pollingStatus ? "Checking..." : "Check status"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex flex-col items-center justify-center">
                    <div
                      onClick={() =>
                        !isSaved && !actionsLocked && thumbRef.current.click()
                      }
                      className="flex h-28 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gray-300"
                    >
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          className="h-full w-full object-cover"
                          alt="Promo thumbnail"
                        />
                      ) : (
                        <div className="text-center text-gray-600">
                          <GrGallery size={22} className="mx-auto mb-1" />
                          <p className="text-xs">
                            {thumbnailName || "No file selected"}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={
                        !selectedThumbnailFile ||
                        isSaved ||
                        thumbnailUploading ||
                        actionsLocked
                      }
                      onClick={handleThumbnailUpload}
                      className="mt-2 flex items-center justify-center gap-[2px] rounded-[14px] border px-2.5 py-0.5 text-[12px] text-[#37af47] disabled:opacity-60"
                    >
                      <MdOutlineFileUpload />
                      {thumbnailUploading ? "Uploading..." : "Upload"}
                    </button>
                  </div>

                  {errors.thumbnail && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.thumbnail}
                    </p>
                  )}

                  <label htmlFor={thumbnailInputId} className="sr-only">
                    Promo thumbnail file
                  </label>
                  <input
                    id={thumbnailInputId}
                    name="promoThumbnailFile"
                    ref={thumbRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleThumbnailSelect(e.target.files[0])}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setOpenDeleteModal(true)}
                  disabled={
                    actionsLocked ||
                    deleting ||
                    // Disable only when the section is truly empty — nothing to clear.
                    (!existingPromoId &&
                      !videoAssetId &&
                      !title.trim() &&
                      !description.trim() &&
                      !thumbnailUrl)
                  }
                  className="rounded-[12px] border border-red-500 px-5 py-0.5 text-sm text-red-500 disabled:opacity-50"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={!isSaved || actionsLocked}
                  className="rounded-[12px] border border-[#37af47] px-5 py-0.5 text-sm text-[#37af47] shadow-2xl shadow-[#37af47] disabled:opacity-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={
                    saving ||
                    actionsLocked ||
                    isSaved ||
                    !isFormValid()
                  }
                  className="flex items-center justify-center gap-[2px] rounded-[12px] border bg-[#37af47] px-4 py-0.5 text-white disabled:opacity-50"
                >
                  <LiaSave className="text-[22px]" />
                  {saving
                    ? "Saving..."
                    : uploading
                      ? "Uploading Video"
                      : pollingStatus
                        ? "Checking Video"
                        : videoStatus && videoStatus !== "READY"
                          ? "Video Processing"
                          : existingPromoId
                            ? "Update"
                            : "Save"}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* ⬇️ NEW: chooser modal */}
      <VideoSourceModal
        open={openVideoSourceModal}
        onClose={() => setOpenVideoSourceModal(false)}
        onDeviceSelect={() => fileRef.current?.click()}
        onLibrarySelect={handleLibraryVideoSelect}
        purpose="PROMO"
      />
      {openDeleteModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-[#1F304A]">
              {existingPromoId ? "Delete Promo" : "Clear Promo Section"}
            </h2>
            <p className="mt-3 text-sm text-gray-600 leading-6">
              {existingPromoId
                ? "Are you sure you want to delete this promo? The video itself stays in the Library — this only removes it from this course."
                : "This will clear your title, description, video, and thumbnail. The uploaded video remains in the Library and can be picked again."}
            </p>


            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpenDeleteModal(false)}
                disabled={deleting}
                className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default forwardRef(PromoVideoSection);