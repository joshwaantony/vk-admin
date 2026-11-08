import axios from "axios";
import axiosInstance from "./axios";

/* ================= GET ALL COURSES ================= */
export const getAllCourses = async () => {
  const res = await axiosInstance.get("/admin/courses");
  return res.data;
};

/* ================= PUBLISHED COURSES (DISPLAY ORDER) ================= */
// Published courses for ordering.
// - languageId (UUID) given  -> that language's courses, in its order
// - languageId omitted       -> every published course, global order
export const getPublishedCoursesApi = async (languageId, config = {}) => {
  const res = await axiosInstance.get("/admin/courses/published", {
    ...config,
    params: languageId ? { languageId } : undefined,
  });
  return res.data;
};

// Always send the COMPLETE ordered list for the scope.
// Global ordering must omit languageId entirely.
export const reorderCoursesApi = async (orderedCourseIds, languageId) => {
  const body = languageId
    ? { languageId, orderedCourseIds }
    : { orderedCourseIds };
  const res = await axiosInstance.put("/admin/courses/reorder", body);
  return res.data;
};

/* ================= CREATE COURSE ================= */
export const createCourseApi = async (payload) => {
  const res = await axiosInstance.post("/courses", payload);
  return res.data;
};


export const getCourseByIdApi = (courseId) =>
  axiosInstance.get(`/admin/courses/${courseId}`);

export const updateCourseApi = (courseId, payload) =>
  axiosInstance.put(`/courses/${courseId}`, payload);
/* ================= DELETE COURSE ================= */
export const deleteCourseApi = async (courseId) => {
  const res = await axiosInstance.delete(`/courses/${courseId}`);
  return res.data;
};

 /* ================= PUBLISH ================= */
export const publishCourse = async (courseId) => {
  const res = await axiosInstance.post(`/courses/${courseId}/publish`);
  return res.data;
};
/* ================= TOGGLE POPULAR ================= */
export const togglePopularApi = async (courseId, isPopular) => {
  const res = await axiosInstance.patch(
    `/admin/courses/${courseId}/popular`,
    { isPopular }
  );
  return res.data;
}

export const replacePromoVideoApi = async (
  courseId,
  videoAssetId,
  videoProvider
) => {
  const res = await axiosInstance.put(`/courses/${courseId}`, {
    promoVideoAssetId: videoAssetId,
    promoVideoProvider: videoProvider,
  });
  return res.data;
};

/* ================= REMOVE PROMO VIDEO ================= */
export const removePromoVideoApi = async (courseId) => {
  const res = await axiosInstance.put(`/courses/${courseId}`, {
    promoVideoAssetId: null,
    promoVideoProvider: null,
  });
  return res.data;
};
