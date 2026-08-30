import axiosInstance from "./axios";

export const getEnrollmentsApi = async ({ page = 1, limit = 20 } = {}) => {
  const res = await axiosInstance.get("/admin/enrollments", {
    params: {
      page,
      limit,
    },
  });

  return res.data;
};

// Backward-compatible alias in case anything still imports the older name.
export const getAdminEnrollmentReportApi = getEnrollmentsApi;

export const getEnrollmentByIdApi = async (enrollmentId) => {
  const res = await axiosInstance.get(`/admin/enrollments/${enrollmentId}`);

  return res.data;
};
