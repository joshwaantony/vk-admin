import * as tus from "tus-js-client";

export const uploadToVimeo = (uploadUrl, file, onProgress) => {
  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: uploadUrl,
      uploadSize: file.size,

      // 🔴 VERY IMPORTANT FOR VIMEO
      removeFingerprintOnSuccess: true,
      uploadUrl: uploadUrl, // 👈 prevent endpoint mutation

      retryDelays: [0, 3000, 5000, 10000],
      metadata: {
        filename: file.name,
        filetype: file.type,
      },

      onProgress: (uploaded, total) => {
        const percentage = Math.floor((uploaded / total) * 100);
        onProgress?.(percentage);
      },

      onError: (error) => {
        console.error("Vimeo upload failed:", error);
        reject(error);
      },

      onSuccess: () => {
        resolve();
      },
    });

    upload.start();
  });
};
