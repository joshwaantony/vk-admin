// State + actions for popular-course ordering, independent of the
// published-order state in useCourseStore. API functions are injected so the
// logic can be tested with a mock backend (tests/popularOrder.test.mjs).
import {
  moveItem,
  sameOrder,
  validatePopularOrder,
} from "../components/Course/CourseList/reorder.js";

/**
 * @param {{
 *   fetchList: (languageId: string|undefined, config: object) => Promise<object[]>,
 *   saveOrder: (courseIds: string[], languageId: string|undefined) => Promise<unknown>,
 * }} api
 */
export const createPopularOrderSlice = (api) => {
  // Only the latest fetch may write to the store, so a slow response for a
  // previous scope never overwrites the current one.
  let requestSeq = 0;
  let abort = null;

  return (set, get) => ({
    languageId: null, // language UUID, or null for the global popular order
    courses: [], // draft order shown on screen
    lastSaved: [], // last order confirmed by the backend
    status: "idle", // idle | loading | ready | error
    error: null,
    saving: false,
    lastFailedOrder: null,

    fetch: async (languageId = null) => {
      const seq = ++requestSeq;
      abort?.abort();
      const controller =
        typeof AbortController !== "undefined" ? new AbortController() : null;
      abort = controller;

      set({
        languageId: languageId || null,
        status: "loading",
        error: null,
        courses: [],
        lastSaved: [],
        lastFailedOrder: null,
      });

      try {
        const list = await api.fetchList(languageId || undefined, {
          signal: controller?.signal,
        });
        if (seq !== requestSeq) return; // stale response
        if (!Array.isArray(list)) throw new Error("Unexpected popular courses response");
        set({ courses: list, lastSaved: list, status: "ready" });
      } catch (error) {
        if (seq !== requestSeq) return; // stale or cancelled
        set({ status: "error", error });
      }
    },

    // Moves only change the draft; nothing is saved until save().
    move: (from, to) => {
      const { saving, status, courses } = get();
      if (saving || status !== "ready") return false;
      const next = moveItem(courses, from, to);
      if (next === courses) return false;
      set({ courses: next });
      return true;
    },

    discard: () => {
      if (get().saving) return;
      set({ courses: get().lastSaved, lastFailedOrder: null });
    },

    dismissFailed: () => set({ lastFailedOrder: null }),

    // Sends the complete ordered id list for the current scope only. On
    // failure the last server-confirmed order is restored.
    save: async () => {
      const { saving, courses: draft, lastSaved: saved, languageId } = get();
      if (saving) throw new Error("A save is already in progress.");
      if (sameOrder(draft, saved)) return false;

      const check = validatePopularOrder(draft, saved.map((c) => c.id), languageId);
      if (!check.ok) throw new Error(check.reason);

      set({ saving: true });
      try {
        await api.saveOrder(check.ids, languageId || undefined);
        if (get().languageId === languageId) {
          set({ lastSaved: draft, lastFailedOrder: null });
        }
        return true;
      } catch (error) {
        if (get().languageId === languageId) {
          set({ courses: saved, lastFailedOrder: draft });
        }
        throw error;
      } finally {
        set({ saving: false });
      }
    },

    retry: async () => {
      const failed = get().lastFailedOrder;
      if (!failed || get().saving) return false;
      set({ courses: failed });
      return get().save();
    },

    // Keeps rows in sync after a thumbnail change made from this screen.
    patchThumbnail: (courseId, thumbnail) => {
      const patch = (list) =>
        list && list.map((c) => (c.id === courseId ? { ...c, thumbnail } : c));
      set({
        courses: patch(get().courses),
        lastSaved: patch(get().lastSaved),
        lastFailedOrder: patch(get().lastFailedOrder),
      });
    },
  });
};
