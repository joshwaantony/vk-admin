import axiosInstance from "./axios";

// CREATE COURSE (Screen 1)
export const createCourseApi = async (payload) => {
  const res = await axiosInstance.post("/admin/courses", payload);
  return res.data;
};

// UPDATE COURSE (Screen 2)
export const updateCourseApi = async (courseId, payload) => {
  const res = await axiosInstance.put(
    `/admin/courses/${courseId}`,
    payload
  );
  return res.data;
};
