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

// Uploads with XHR so progress can be reported (fetch has no upload progress).
const postWithProgress = (url, body, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, data });
    };
    xhr.onerror = () => reject(new Error("Network error while uploading image"));
    xhr.onabort = () => reject(new Error("Image upload was cancelled"));
    xhr.send(body);
  });

/**
 * @param {File} file
 * @param {string} purpose one of ALLOWED_PURPOSES
 * @param {{ onProgress?: (percent: number) => void }} [options]
 * @returns {Promise<string>} Cloudinary secure_url
 */
export const uploadImageToCloudinary = async (file, purpose, options = {}) => {
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

  let ok;
  let data = null;

  if (typeof options.onProgress === "function") {
    ({ ok, data } = await postWithProgress(
      signatureData.uploadUrl,
      formData,
      options.onProgress
    ));
  } else {
    const res = await fetch(signatureData.uploadUrl, {
      method: "POST",
      body: formData,
    });
    ok = res.ok;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
  }

  if (!ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      "Image upload failed";
    throw new Error(message);
  }

  return data?.secure_url || "";
};
