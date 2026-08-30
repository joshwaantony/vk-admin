//video.service.js
import axiosInstance from "@/services/axios";
import { uploadImageToCloudinary } from "@/utils/cloudinaryImageUpload";
import { uploadToVimeo } from "@/utils/vimeoUpload";

export const initiateVideoUpload = async (payload) => {
  const res = await axiosInstance.post("/videos/initiate", payload);
  return res.data?.data ?? res.data;
};

export const getVideoStatusApi = async (videoId) => {
  const res = await axiosInstance.get(`/videos/${videoId}/status`);
  return res.data?.data ?? res.data;
};

export const uploadVideoWithThumbnail = async ({
  purpose,
  title,
  description,
  folderId,
  videoFile,
  thumbnailFile,
  onProgress,
}) => {
  const thumbnailUrl = await uploadImageToCloudinary(
    thumbnailFile,
    "LESSON_THUMBNAIL"
  );

  const initData = await initiateVideoUpload({
    purpose,
    size: videoFile.size,
    title,
    description,
    folderId,
    thumbnail: thumbnailUrl,
  });

  const { uploadUrl, videoAssetId } = initData;

  await uploadToVimeo(uploadUrl, videoFile, onProgress);

  return { success: true, videoAssetId };
};

export const getLibraryVideos = async ({
  q = "",
  purpose = "",
  status = "",
  includeArchived = false,
  page = 1,
  limit = 20,
  folderId = "",
} = {}) => {
  const rawParams = {
    q,
    purpose,
    status,
    includeArchived,
    page,
    limit,
    folderId,
  };

  // Strip "" / null / undefined so the backend doesn't reject empty enums.
  // false is kept (valid value for includeArchived).
  const params = Object.fromEntries(
    Object.entries(rawParams).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined
    )
  );

  const res = await axiosInstance.get("/videos", { params });
  return res.data;
};

export const deleteVideoApi = async (videoId) => {
  const res = await axiosInstance.delete(`/videos/${videoId}`);
  return res.data;
};

/**
 * Continuously poll GET /videos/:id/status until the video is READY.
 *
 * Resolves: { success, status, data?, error? }
 *   - status === "READY"  → success: true
 *   - "ERROR" / "FAILED"  → success: false
 *   - "TIMEOUT"           → maxAttempts exhausted (~1 hour at defaults)
 *   - "CANCELLED"         → shouldContinue() returned false
 *
 * Options:
 *   - onStatusChange(status, data): called after every successful poll
 *   - intervalMs:   default 5000
 *   - maxAttempts:  default 720  (~1 hour at 5s)
 *   - shouldContinue(): return false to stop (unmount cancellation)
 *
 * Transient network errors don't abort the loop — retries up to 3
 * consecutive failures before giving up.
 */
export const pollVideoStatusUntilReady = async (videoId, options = {}) => {
  const {
    onStatusChange,
    intervalMs = 5000,
    maxAttempts = 720,
    shouldContinue = () => true,
  } = options;

  if (!videoId) {
    return { success: false, status: null, reason: "no videoId" };
  }

  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (!shouldContinue()) {
      return { success: false, status: "CANCELLED" };
    }

    try {
      const data = await getVideoStatusApi(videoId);
      const status = data?.status;
      consecutiveErrors = 0;
      onStatusChange?.(status, data);

      if (status === "READY") return { success: true, status, data };
      if (status === "FAILED") {
        return { success: false, status, data };
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    } catch (error) {
      consecutiveErrors++;
      console.warn(
        `Status poll attempt ${attempt + 1} failed:`,
        error?.response?.data?.message || error?.message || error
      );

      if (consecutiveErrors >= maxConsecutiveErrors) {
        return { success: false, status: null, error };
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }

  return { success: false, status: "TIMEOUT" };
};