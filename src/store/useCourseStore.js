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
  getCourseByIdApi,
  getPublishedCoursesApi,
  reorderCoursesApi,
} from "@/services/coursesApi";
import {
  moveItem,
  sameOrder,
  validateOrder,
} from "@/components/Course/CourseList/reorder";

const toCourseArray = (body) => {
  const data = body?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.courses)) return data.courses;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

// Only the latest published-courses request may write to the store, so a
// slow response for a previously selected language can never overwrite the
// current one.
let publishedRequestSeq = 0;
let publishedAbort = null;

const useCourseStore = create((set, get) => ({
  /* ================= STATE ================= */
  loading: false,
  error: null,
  courseId: null,
  courses: [],
  currentCourse: null,

  // Published-course display order (admin "Display order" page)
  orderLanguageId: null, // language UUID, or null for the global order
  publishedCourses: [], // draft order shown on screen
  lastSavedPublished: [], // last order confirmed by the backend
  publishedStatus: "idle", // idle | loading | ready | error
  publishedError: null,
  reorderSaving: false,
  lastFailedOrder: null, // order a failed save attempted (for "Retry save")

  /* ================= FETCH ALL COURSES ================= */
fetchCourses: async () => {
  try {
    set({ loading: true, error: null });

    const res = await getAllCourses();

    console.log("COURSES API:", res);

    // Accepts { data: [...] } and { data: { courses: [...] } }.
    set({ courses: toCourseArray(res) });

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
      throw error;
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

  /* ================= PUBLISHED COURSES: FETCH ================= */
  // languageId: UUID for a language's order, null/undefined for global order.
  // Courses are kept exactly in the order the backend returns.
  fetchPublishedCourses: async (languageId = null) => {
    const seq = ++publishedRequestSeq;
    publishedAbort?.abort();
    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    publishedAbort = controller;

    set({
      orderLanguageId: languageId || null,
      publishedStatus: "loading",
      publishedError: null,
      publishedCourses: [],
      lastSavedPublished: [],
      lastFailedOrder: null,
    });

    try {
      const res = await getPublishedCoursesApi(languageId || undefined, {
        signal: controller?.signal,
      });
      if (seq !== publishedRequestSeq) return; // stale response
      const list = res?.data;
      if (!Array.isArray(list)) {
        throw new Error("Unexpected response from /admin/courses/published");
      }
      set({
        publishedCourses: list,
        lastSavedPublished: list,
        publishedStatus: "ready",
      });
    } catch (error) {
      if (seq !== publishedRequestSeq) return; // stale or cancelled
      set({ publishedStatus: "error", publishedError: error });
    }
  },

  /* ================= PUBLISHED COURSES: LOCAL EDITS ================= */
  // Moves only change the draft; nothing is saved until savePublishedOrder.
  movePublishedCourse: (from, to) => {
    const { reorderSaving, publishedStatus, publishedCourses } = get();
    if (reorderSaving || publishedStatus !== "ready") return false;
    const next = moveItem(publishedCourses, from, to);
    if (next === publishedCourses) return false;
    set({ publishedCourses: next });
    return true;
  },

  discardPublishedOrder: () => {
    if (get().reorderSaving) return;
    set({ publishedCourses: get().lastSavedPublished, lastFailedOrder: null });
  },

  dismissFailedOrder: () => set({ lastFailedOrder: null }),

  /* ================= PUBLISHED COURSES: SAVE ================= */
  // Sends the complete ordered id list for the current scope. On failure the
  // last server-confirmed order is restored and the attempt kept for retry.
  savePublishedOrder: async () => {
    const {
      reorderSaving,
      publishedCourses: draft,
      lastSavedPublished: saved,
      orderLanguageId: languageId,
    } = get();

    if (reorderSaving) {
      throw new Error("A save is already in progress.");
    }
    if (sameOrder(draft, saved)) return false;

    const check = validateOrder(
      draft,
      saved.map((c) => c.id),
      languageId
    );
    if (!check.ok) throw new Error(check.reason);

    set({ reorderSaving: true });
    try {
      await reorderCoursesApi(check.ids, languageId || undefined);
      // Ignore if the scope changed meanwhile (UI blocks this; defensive).
      if (get().orderLanguageId === languageId) {
        set({ lastSavedPublished: draft, lastFailedOrder: null });
      }
      return true;
    } catch (error) {
      if (get().orderLanguageId === languageId) {
        set({ publishedCourses: saved, lastFailedOrder: draft });
      }
      throw error;
    } finally {
      set({ reorderSaving: false });
    }
  },

  retryPublishedOrder: async () => {
    const failed = get().lastFailedOrder;
    if (!failed || get().reorderSaving) return false;
    set({ publishedCourses: failed });
    return get().savePublishedOrder();
  },

  /* ================= THUMBNAIL ================= */
  // Persists an already-uploaded Cloudinary URL. Local lists are only updated
  // after the backend confirms, so a failure keeps the old thumbnail.
  updateCourseThumbnail: async (courseId, thumbnailUrl) => {
    if (!courseId || !thumbnailUrl) {
      throw new Error("Course and thumbnail are required");
    }
    await updateCourseApi(courseId, { thumbnail: thumbnailUrl });

    const patch = (list) =>
      list.map((c) =>
        c.id === courseId ? { ...c, thumbnail: thumbnailUrl } : c
      );
    set({
      courses: patch(get().courses),
      publishedCourses: patch(get().publishedCourses),
      lastSavedPublished: patch(get().lastSavedPublished),
      lastFailedOrder: get().lastFailedOrder && patch(get().lastFailedOrder),
    });
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
