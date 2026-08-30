import axiosInstance from "@/services/axios";

const ALLOWED_PURPOSES = [
  "COURSE_THUMBNAIL",
  "LESSON_THUMBNAIL",
  "FACULTY_IMAGE",
  "PROMO_IMAGE",
  "CATEGORY_ICON",
];

const getFileExtension = (file) => {
  const name = file?.name || "";
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext && ext !== name.toLowerCase()) return ext;
  return file?.type?.split("/")?.[1]?.toLowerCase() || "";
};

export const uploadImageToCloudinary = async (file, purpose) => {
  if (!file) return "";

  if (!purpose || !ALLOWED_PURPOSES.includes(purpose)) {
    throw new Error(
      `Invalid image upload purpose. Allowed: ${ALLOWED_PURPOSES.join(", ")}`
    );
  }

  const signatureRes = await axiosInstance.post(
    "/uploads/cloudinary/signature",
    { purpose }
  );

  const signatureData = signatureRes?.data?.data;
  if (!signatureData?.uploadUrl) {
    throw new Error("Failed to get Cloudinary upload signature");
  }

  if (
    typeof signatureData.maxFileSize === "number" &&
    file.size > signatureData.maxFileSize
  ) {
    throw new Error(
      `File too large. Max ${Math.round(signatureData.maxFileSize / 1024 / 1024)}MB`
    );
  }

  if (Array.isArray(signatureData.allowedFormats) && signatureData.allowedFormats.length) {
    const ext = getFileExtension(file);
    if (ext && !signatureData.allowedFormats.includes(ext)) {
      throw new Error(
        `Unsupported file format. Allowed: ${signatureData.allowedFormats.join(", ")}`
      );
    }
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signatureData.apiKey);
  formData.append("timestamp", signatureData.timestamp);
  formData.append("signature", signatureData.signature);
  if (signatureData.folder) formData.append("folder", signatureData.folder);
  if (Array.isArray(signatureData.allowedFormats) && signatureData.allowedFormats.length) {
    formData.append("allowed_formats", signatureData.allowedFormats.join(","));
  }
  if (signatureData.uploadPreset) {
    formData.append("upload_preset", signatureData.uploadPreset);
  }

  const res = await fetch(signatureData.uploadUrl, {
    method: "POST",
    body: formData,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      "Image upload failed";
    throw new Error(message);
  }

  return data?.secure_url || "";
};
