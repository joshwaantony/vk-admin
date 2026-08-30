import axios from "axios";
import useAuthStore from "@/store/useAuthStore";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const CLIENT_TYPE = "admin-web";
const AUTH_ERROR_MESSAGE =
  "Session expired or unauthorized. Please login again.";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "x-client-type": CLIENT_TYPE,
  },
});

let isRedirecting = false;
let refreshPromise = null;

const getAccessTokenFromResponse = (response) =>
  response?.data?.data?.accessToken || response?.data?.accessToken;

const clearAuthAndRedirect = () => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    error: null,
    loading: false,
  });

  if (typeof window === "undefined" || isRedirecting) return;

  isRedirecting = true;
  toast.error(AUTH_ERROR_MESSAGE);
  window.location.href = "/admin";

  setTimeout(() => {
    isRedirecting = false;
  }, 1000);
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        "/auth/refresh",
        {},
        {
          baseURL: API_BASE_URL,
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "x-client-type": CLIENT_TYPE,
          },
        }
      )
      .then((response) => {
        const accessToken = getAccessTokenFromResponse(response);

        if (!accessToken) {
          throw new Error("Refresh response did not include an access token");
        }

        useAuthStore.setState({ accessToken, error: null });
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

axiosInstance.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  config.withCredentials = true;
  config.headers = config.headers || {};
  config.headers["x-client-type"] = CLIENT_TYPE;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";

    const isLoginRequest = requestUrl.includes("/auth/login");
    const isRefreshRequest = requestUrl.includes("/auth/refresh");

    // login failure should stay on login page
    if (isLoginRequest || isRefreshRequest) {
      return Promise.reject(error);
    }

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const accessToken = await refreshAccessToken();

        originalRequest.withCredentials = true;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers["x-client-type"] = CLIENT_TYPE;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    if ((status === 401 && originalRequest?._retry) || status === 403) {
      clearAuthAndRedirect();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
