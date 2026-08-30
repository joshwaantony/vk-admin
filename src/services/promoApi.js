// import axiosInstance from "@/services/axios";

// export const getActivePromoApi = async () => {
//   const res = await axiosInstance.get("/admin/promos/active");
//   return res.data;
// };

// export const createPromoApi = async (payload) => {
//   const res = await axiosInstance.post("/admin/promos", payload);
//   return res.data;
// };

// export const getPromoByIdApi = async (promoId) => {
//   const res = await axiosInstance.get(`/admin/promos/${promoId}`);
//   return res.data;
// };

// export const updatePromoApi = async (promoId, payload) => {
//   const res = await axiosInstance.patch(`/admin/promos/${promoId}`, payload);
//   return res.data;
// };

// export const deletePromoApi = async (promoId) => {
//   const res = await axiosInstance.delete(`/admin/promos/${promoId}`);
//   return res.data;
// };


// import axiosInstance from "@/services/axios";

// export const getActivePromoApi = async () => {
//   const res = await axiosInstance.get("/admin/promos/active");
//   return res.data;
// };

// export const createPromoApi = async (payload) => {
//   const res = await axiosInstance.post("/admin/promos", payload);
//   return res.data;
// };

// export const getPromoByIdApi = async (promoId) => {
//   const res = await axiosInstance.get(`/admin/promos/${promoId}`);
//   return res.data;
// };

// export const updatePromoApi = async (promoId, payload) => {
//   const res = await axiosInstance.patch(`/admin/promos/${promoId}`, payload);
//   return res.data;
// };

// export const deletePromoApi = async (promoId) => {
//   const res = await axiosInstance.delete(`/admin/promos/${promoId}`);
//   return res.data;
// };


import axiosInstance from "@/services/axios";

export const getActivePromoApi = async () => {
  const res = await axiosInstance.get("/admin/promos/active");
  return res.data;
};

export const createPromoApi = async (payload) => {
  const res = await axiosInstance.post("/admin/promos", payload);
  return res.data;
};

export const getPromoByIdApi = async (promoId) => {
  const res = await axiosInstance.get(`/admin/promos/${promoId}`);
  return res.data;
};

export const updatePromoApi = async (promoId, payload) => {
  const res = await axiosInstance.put(`/admin/promos/${promoId}`, payload);
  return res.data;
};

export const deletePromoApi = async (promoId) => {
  const res = await axiosInstance.delete(`/admin/promos/${promoId}`);
  return res.data;
};