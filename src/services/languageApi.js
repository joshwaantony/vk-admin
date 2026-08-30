import axiosInstance from "./axios";

export const getLanguagesApi = async () => {
  const res = await axiosInstance.get("/admin/languages");
  return res.data;
};
