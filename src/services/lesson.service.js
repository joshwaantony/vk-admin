import axiosInstance from "./axios";

export const createLesson = async (payload) => {
  const res = await axiosInstance.post("/lessons", payload);
  return res.data.data;
};

export const getLessonById = async (lessonId) => {
  const res = await axiosInstance.get(`/lessons/${lessonId}`);
  return res.data.data;
};

export const updateLesson = async (lessonId, payload) => {
  const res = await axiosInstance.put(`/lessons/${lessonId}`, payload);
  return res.data.data;
};

export const deleteLesson = async (lessonId) => {
  await axiosInstance.delete(`/lessons/${lessonId}`);
};

export const reorderLessons = async (payload) => {
  await axiosInstance.post("/lessons/reorder", payload);
};