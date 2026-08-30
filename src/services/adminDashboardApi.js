import axiosInstance from "./axios";

export const getAdminDashboardApi = async () => {
  const response = await axiosInstance.get("/admin/dashboard");
  return response.data;
};