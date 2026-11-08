import { create } from "zustand";
import {
  getPopularCoursesApi,
  reorderPopularCoursesApi,
} from "@/services/coursesApi";
import { createPopularOrderSlice } from "./popularOrderSlice";

// Popular-course display order (Popular mode on /courses/order).
// Kept separate from useCourseStore so the published order is untouched.
const usePopularOrderStore = create(
  createPopularOrderSlice({
    fetchList: getPopularCoursesApi,
    saveOrder: reorderPopularCoursesApi,
  })
);

export default usePopularOrderStore;
