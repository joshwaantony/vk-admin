import axiosInstance from "./axios";

export const fetchCategoriesApi = async () => {
  const res = await axiosInstance.get("/categories/tree");
  return res.data.data;
};
export const createCategoryApi = async (payload) => {
  const res = await axiosInstance.post("/categories", payload);
  return res.data.data;
};
export const updateCategoryApi = async (id, payload) => {
  const res = await axiosInstance.put(`/categories/${id}`, payload);
  return res.data.data;
};

export const deleteCategoryApi = async (id) => {
  const res = await axiosInstance.delete(`/categories/${id}`);
  return res.data.data;
};
