import { create } from "zustand";
import {
  createCourseApi,
  updateCourseApi,
  getAllCourses,
  deleteCourseApi,
  replacePromoVideoApi,
  removePromoVideoApi,
  togglePopularApi,
  publishCourse,
  getCourseByIdApi
} from "@/services/coursesApi";

const useCourseStore = create((set, get) => ({
  /* ================= STATE ================= */
  loading: false,
  error: null,
  courseId: null,
  courses: [],
  currentCourse: null,

  /* ================= FETCH ALL COURSES ================= */
fetchCourses: async () => {
  try {
    set({ loading: true, error: null });

    const res = await getAllCourses();

    console.log("COURSES API:", res);

    set({
      courses: res?.data || []   // ✅ FIXED
    });

  } catch (error) {
    console.error("Fetch error:", error);
    set({ error });
  } finally {
    set({ loading: false });
  }
},


  /* ================= CREATE COURSE ================= */
  createCourse: async (payload) => {
    try {
      set({ loading: true, error: null });

      const res = await createCourseApi(payload);
      const newCourseId = res.data?.id || res.id;

      set({
        courseId: newCourseId,
        currentCourse: null, // 🔥 ensure no old draft data
      });

      await get().fetchCourses();
      return newCourseId;

    } catch (error) {
      set({ error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  /* ================= UPDATE COURSE ================= */
  updateCourse: async (payload) => {
    const courseId = get().courseId;

    if (!courseId) {
      throw new Error("Course ID not found. Create course first.");
    }

    try {
      set({ loading: true, error: null });

      await updateCourseApi(courseId, payload);

      // 🔥 refresh list
      await get().fetchCourses();

    } catch (error) {
      set({ error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  /* ================= PUBLISH COURSE ================= */
  publishCourseAction: async (courseId) => {
    try {
      set({ loading: true, error: null });

      await publishCourse(courseId);
      await get().fetchCourses();

    } catch (error) {
      set({ error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  /* ================= TOGGLE POPULAR ================= */
  togglePopular: async (courseId, currentValue) => {
    const newValue = !currentValue;

    // Optimistic UI update
    set({
      courses: get().courses.map((c) =>
        c.id === courseId ? { ...c, isPopular: newValue } : c
      ),
    });

    try {
      await togglePopularApi(courseId, newValue);
    } catch (error) {
      // rollback
      set({
        courses: get().courses.map((c) =>
          c.id === courseId ? { ...c, isPopular: currentValue } : c
        ),
        error,
      });
    }
  },

  /* ================= PROMO VIDEO ================= */
  replacePromoVideo: async (videoAssetId, videoProvider) => {
    const courseId = get().courseId;
    if (!courseId) throw new Error("Course not created");

    try {
      set({ loading: true, error: null });
      await replacePromoVideoApi(courseId, videoAssetId, videoProvider);
    } catch (error) {
      set({ error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removePromoVideo: async () => {
    const courseId = get().courseId;
    if (!courseId) throw new Error("Course not created");

    try {
      set({ loading: true, error: null });
      await removePromoVideoApi(courseId);
    } catch (error) {
      set({ error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // /* ================= DELETE COURSE ================= */
  // deleteCourse: async (courseId) => {
  //   try {
  //     set({ loading: true, error: null });

  //     await deleteCourseApi(courseId);
  //     await get().fetchCourses();

  //   } catch (error) {
  //     set({ error });
  //   } finally {
  //     set({ loading: false });
  //   }
  // },
  deleteCourse: async (courseId) => {
  try {
    set({ loading: true, error: null });

    await deleteCourseApi(courseId);

    // ✅ instant UI update (better UX)
    set({
      courses: get().courses.filter((c) => c.id !== courseId),
    });

  } catch (error) {
    set({ error });
    throw error;
  } finally {
    set({ loading: false });
  }
},
/* ================= FETCH COURSE BY ID ================= */
fetchCourseById: async (courseId) => {
  try {
    set({ loading: true, error: null });

    const res = await getCourseByIdApi(courseId);

    console.log("COURSE BY ID:", res);

    set({
       currentCourse: res?.data?.data || null,
      courseId: courseId, // ✅ important
    });

  } catch (error) {
    console.error("Fetch by ID error:", error);
    set({ error });
  } finally {
    set({ loading: false });
  }
},

  /* ================= HELPERS ================= */

  setCourseId: (id) =>
    set({
      courseId: id,
    }),

  setCurrentCourse: (course) =>
    set({
      currentCourse: course,
      courseId: course?.id || null,
    }),

  resetCourse: () =>
    set({
      courseId: null,
      currentCourse: null,
      error: null,
    }),
}));

export default useCourseStore;
