import axiosInstance from "./axios";

export const getLanguagesApi = async () => {
  const res = await axiosInstance.get("/admin/languages");
  return res.data;
};

export const getActiveLanguagesApi = async () => {
  const res = await axiosInstance.get("/languages");
  return res.data;
};

export const createLanguageApi = async (payload) => {
  const res = await axiosInstance.post("/admin/languages", payload);
  return res.data;
};

export const getLanguageByIdApi = async (languageId) => {
  const res = await axiosInstance.get(`/admin/languages/${languageId}`);
  return res.data;
};

export const updateLanguageApi = async (languageId, payload) => {
  const res = await axiosInstance.patch(`/admin/languages/${languageId}`, payload);
  return res.data;
};

export const deleteLanguageApi = async (languageId) => {
  const res = await axiosInstance.delete(`/admin/languages/${languageId}`);
  return res.data;
};

export const reorderLanguagesApi = async (orderedLanguageIds) => {
  const res = await axiosInstance.post("/admin/languages/reorder", {
    orderedLanguageIds,
  });
  return res.data;
};
