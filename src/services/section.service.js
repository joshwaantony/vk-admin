//services/section.service.js
import axiosInstance from "@/services/axios";

export const createSectionApi = async ({ courseId, title }) => {
  const res = await axiosInstance.post("/sections", {
    courseId,
    title,
  });

  return res.data.data; // { id }
};
/* UPDATE SECTION */
export const updateSectionApi = async ({ sectionId, title }) => {
  const res = await axiosInstance.put(`/sections/${sectionId}`, {
    title,
  });

  return res.data.data;
};
/* DELETE SECTION */
export const deleteSectionApi = async (sectionId) => {
  const res = await axiosInstance.delete(`/sections/${sectionId}`);
  return res.data;
};
// services/section.service.js

export const getSectionByIdApi = async (sectionId) => {
  const res = await axiosInstance.get(`/sections/${sectionId}`);
  return res.data.data;
};

