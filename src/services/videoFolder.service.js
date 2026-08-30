//videoFolder.service.js
import axiosInstance from "@/services/axios";

export const getVideoFolders = async () => {
  const res = await axiosInstance.get("/video-folders");
  return res.data?.data ?? res.data;
};

// CREATE VIDEO FOLDER
export const createVideoFolder = async ({
  name,
  parentId = null,
}) => {
  const res = await axiosInstance.post("/video-folders", {
    name,
    parentId,
  });

  console.log("video folder #$%#$%^",res)

  return res.data;
};

// UPDATE VIDEO FOLDER
export const updateVideoFolder = async ({
  videoFolderId,
  name,
  parentId = null,
}) => {
  const res = await axiosInstance.patch(
    `/video-folders/${videoFolderId}`,
    {
      name,
      parentId,
    }
  );

  return res.data;
};

// DELETE VIDEO FOLDER
export const deleteVideoFolder = async (videoFolderId) => {
  const res = await axiosInstance.delete(
    `/video-folders/${videoFolderId}`
  );

  return res.data;
};