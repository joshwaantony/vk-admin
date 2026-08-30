

import axiosInstance from "@/services/axios";

import { uploadToVimeo } from "@/utils/vimeoUpload";

import { uploadImageToCloudinary } from "@/utils/cloudinaryImageUpload";

// INITIATE VIDEO UPLOAD
export const initiateVideoUpload =
  async ({
    purpose,
    size,
    title,
    thumbnail,
    description,
    folderId,
  }) => {
    const res =
      await axiosInstance.post(
        "/videos/initiate",
        {
          purpose,
          size,
          title,
          thumbnail,
          description,
          folderId, // IMPORTANT
        }
      );

    return res.data.data;
  };

// FULL VIDEO UPLOAD FLOW
export const uploadVideoWithThumbnail =
  async ({
    purpose,
    title,
    description,
    folderId,
    videoFile,
    thumbnailFile,
    onProgress,
  }) => {
    // 1. UPLOAD THUMBNAIL
    const thumbnailUrl =
      await uploadImageToCloudinary(
        thumbnailFile,
        "LESSON_THUMBNAIL"
      );

    // 2. INITIATE VIDEO
    const initData =
      await initiateVideoUpload({
        purpose,
        size: videoFile.size,
        title,
        description,
        folderId, // IMPORTANT
        thumbnail:
          thumbnailUrl,
      });

    const {
      uploadUrl,
      videoAssetId,
    } = initData;

    // 3. UPLOAD VIDEO TO VIMEO
    await uploadToVimeo(
      uploadUrl,
      videoFile,
      onProgress
    );

    // DONE
    return {
      success: true,
      videoAssetId,
    };
  };

// GET VIDEOS
export const getLibraryVideos =
  async ({
    q = "",
    purpose = "LESSON",
    status = "READY",
    includeArchived = false,
    page = 1,
    limit = 20,
    folderId = "",
  }) => {
    const res =
      await axiosInstance.get(
        "/videos",
        {
          params: {
            q,
            purpose,
            status,
            includeArchived,
            page,
            limit,
            folderId, // IMPORTANT
          },
        }
      );

    return res.data;
  };

// GET SINGLE VIDEO
export const getVideoById =
  async (videoId) => {
    const res =
      await axiosInstance.get(
        `/videos/${videoId}`
      );

    return res.data;
  };

// GET VIDEO STATUS
export const getVideoStatus =
  async (videoId) => {
    const res =
      await axiosInstance.get(
        `/videos/${videoId}/status`
      );

    return res.data;
  };