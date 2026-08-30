import axiosInstance from "./axios";
export const loginApi = async (phone, password) => {
  const response = await axiosInstance.post(
    "/auth/login",
    {
      phone,
      password,
    },
    {
      withCredentials: true,
      headers: {
        "x-client-type": "admin-web",
      },
    }
  );
  return response.data;
};
export const logoutApi = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};
