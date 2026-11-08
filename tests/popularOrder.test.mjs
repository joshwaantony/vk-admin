import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "zustand/vanilla";
import {
  POPULAR_REORDER_GLOBAL_URL,
  POPULAR_REORDER_LANGUAGE_URL,
  buildPopularReorderRequest,
  extractPopularList,
} from "../src/components/Course/CourseList/popularOrder.js";
import { validatePopularOrder, validateOrder } from "../src/components/Course/CourseList/reorder.js";
import { createPopularOrderSlice } from "../src/store/popularOrderSlice.js";

const EN = "lang-en";
const ML = "lang-ml";
const pop = (id, languageId, extra = {}) => ({
  id,
  title: id,
  languageId,
  status: "PUBLISHED",
  isPopular: true,
  ...extra,
});

/**
 * In-memory backend that stores the global order and each language order
 * separately, mirroring popularDisplayOrder vs popularLanguageDisplayOrder.
 */
function fakeBackend(courses) {
  const state = {
    global: courses.map((c) => c.id),
    byLang: {},
    calls: [],
    failNextSave: false,
  };
  courses.forEach((c) => {
    (state.byLang[c.languageId] ||= []).push(c.id);
  });
  const byId = new Map(courses.map((c) => [c.id, c]));

  const api = {
    fetchList: async (languageId) => {
      state.calls.push({ type: "fetch", languageId });
      const ids = languageId ? state.byLang[languageId] || [] : state.global;
      return ids.map((id) => byId.get(id));
    },
    saveOrder: async (courseIds, languageId) => {
      const req = buildPopularReorderRequest(courseIds, languageId || null);
      state.calls.push({ type: "save", ...req });
      if (state.failNextSave) {
        state.failNextSave = false;
        throw new Error("Network down");
      }
      if (req.url === POPULAR_REORDER_GLOBAL_URL) state.global = [...courseIds];
      else state.byLang[req.body.languageId] = [...courseIds];
      return { success: true };
    },
  };
  return { state, api };
}

const COURSES = [
  pop("e1", EN),
  pop("e2", EN),
  pop("m1", ML),
  pop("m2", ML),
  pop("m3", ML),
];

const setup = () => {
  const backend = fakeBackend(COURSES);
  const store = createStore(createPopularOrderSlice(backend.api));
  return { ...backend, store };
};

const ids = (list) => list.map((c) => c.id);

/* ================= Pure helpers ================= */

describe("extractPopularList", () => {
  test("accepts { data: [...] }", () => {
    assert.deepEqual(extractPopularList({ data: [{ id: "a" }] }), [{ id: "a" }]);
  });
  test("accepts { data: { courses: [...] } }", () => {
    assert.deepEqual(extractPopularList({ data: { courses: [{ id: "a" }] } }), [{ id: "a" }]);
  });
  test("returns null for unknown shapes", () => {
    assert.equal(extractPopularList({ data: { items: [] } }), null);
    assert.equal(extractPopularList(null), null);
  });
});

describe("buildPopularReorderRequest", () => {
  test("global scope -> global endpoint, no languageId", () => {
    assert.deepEqual(buildPopularReorderRequest(["a", "b"]), {
      url: POPULAR_REORDER_GLOBAL_URL,
      body: { courseIds: ["a", "b"] },
    });
  });
  test("language scope -> language endpoint with languageId", () => {
    assert.deepEqual(buildPopularReorderRequest(["a"], EN), {
      url: POPULAR_REORDER_LANGUAGE_URL,
      body: { languageId: EN, courseIds: ["a"] },
    });
  });
});

describe("validatePopularOrder", () => {
  test("accepts a full permutation of popular courses", () => {
    const r = validatePopularOrder([pop("b", EN), pop("a", EN)], ["a", "b"], EN);
    assert.deepEqual(r, { ok: true, ids: ["b", "a"] });
  });
  test("rejects a non-popular course", () => {
    const r = validatePopularOrder([pop("a", EN), pop("b", EN, { isPopular: false })], ["a", "b"]);
    assert.equal(r.ok, false);
  });
  test("keeps all validateOrder checks (duplicates, language, missing)", () => {
    assert.equal(validatePopularOrder([pop("a", EN), pop("a", EN)], ["a", "b"]).ok, false);
    assert.equal(validatePopularOrder([pop("a", EN), pop("b", ML)], ["a", "b"], EN).ok, false);
    assert.equal(validatePopularOrder([pop("a", EN)], ["a", "b"]).ok, false);
  });
  test("validateOrder is unchanged: it does not look at isPopular", () => {
    const list = [pop("a", EN), pop("b", EN, { isPopular: false })];
    assert.equal(validateOrder(list, ["a", "b"]).ok, true);
  });
});

/* ================= Store ================= */

describe("popular order store", () => {
  test("global fetch loads the global order", async () => {
    const { store, state } = setup();
    await store.getState().fetch(null);
    const s = store.getState();
    assert.equal(s.status, "ready");
    assert.equal(s.languageId, null);
    assert.deepEqual(ids(s.courses), ["e1", "e2", "m1", "m2", "m3"]);
    assert.deepEqual(state.calls[0], { type: "fetch", languageId: undefined });
  });

  test("language fetch loads only that language", async () => {
    const { store } = setup();
    await store.getState().fetch(ML);
    assert.deepEqual(ids(store.getState().courses), ["m1", "m2", "m3"]);
  });

  test("saving global order never changes any language order", async () => {
    const { store, state } = setup();
    await store.getState().fetch(null);
    store.getState().move(4, 0); // m3 to top
    assert.equal(await store.getState().save(), true);

    assert.deepEqual(state.global, ["m3", "e1", "e2", "m1", "m2"]);
    assert.deepEqual(state.byLang[ML], ["m1", "m2", "m3"]);
    assert.deepEqual(state.byLang[EN], ["e1", "e2"]);
    const save = state.calls.find((c) => c.type === "save");
    assert.equal(save.url, POPULAR_REORDER_GLOBAL_URL);
    assert.equal("languageId" in save.body, false);
  });

  test("saving a language order never changes the global order", async () => {
    const { store, state } = setup();
    await store.getState().fetch(ML);
    store.getState().move(0, 2); // m1 to bottom
    await store.getState().save();

    assert.deepEqual(state.byLang[ML], ["m2", "m3", "m1"]);
    assert.deepEqual(state.global, ["e1", "e2", "m1", "m2", "m3"]);
    const save = state.calls.find((c) => c.type === "save");
    assert.equal(save.url, POPULAR_REORDER_LANGUAGE_URL);
    assert.deepEqual(save.body, { languageId: ML, courseIds: ["m2", "m3", "m1"] });
  });

  test("switching scopes loads each scope's own saved order", async () => {
    const { store } = setup();
    await store.getState().fetch(ML);
    store.getState().move(0, 2);
    await store.getState().save();

    await store.getState().fetch(null);
    assert.deepEqual(ids(store.getState().courses), ["e1", "e2", "m1", "m2", "m3"]);
    await store.getState().fetch(ML);
    assert.deepEqual(ids(store.getState().courses), ["m2", "m3", "m1"]);
    await store.getState().fetch(EN);
    assert.deepEqual(ids(store.getState().courses), ["e1", "e2"]);
  });

  test("discard restores the last saved order without calling the API", async () => {
    const { store, state } = setup();
    await store.getState().fetch(EN);
    store.getState().move(0, 1);
    store.getState().discard();
    assert.deepEqual(ids(store.getState().courses), ["e1", "e2"]);
    assert.equal(state.calls.some((c) => c.type === "save"), false);
  });

  test("save with no changes does not call the API", async () => {
    const { store, state } = setup();
    await store.getState().fetch(EN);
    assert.equal(await store.getState().save(), false);
    assert.equal(state.calls.some((c) => c.type === "save"), false);
  });

  test("failed save restores the last server order and allows retry", async () => {
    const { store, state } = setup();
    await store.getState().fetch(EN);
    store.getState().move(0, 1);
    state.failNextSave = true;

    await assert.rejects(store.getState().save(), /Network down/);
    let s = store.getState();
    assert.deepEqual(ids(s.courses), ["e1", "e2"]); // rolled back
    assert.deepEqual(ids(s.lastFailedOrder), ["e2", "e1"]);
    assert.equal(s.saving, false);
    assert.deepEqual(state.byLang[EN], ["e1", "e2"]); // backend untouched

    assert.equal(await store.getState().retry(), true);
    s = store.getState();
    assert.deepEqual(ids(s.courses), ["e2", "e1"]);
    assert.equal(s.lastFailedOrder, null);
    assert.deepEqual(state.byLang[EN], ["e2", "e1"]);
  });

  test("a second save while one is in flight is rejected", async () => {
    const { store, state, api } = setup();
    let release;
    api.saveOrder = () => new Promise((r) => (release = r));
    await store.getState().fetch(EN);
    store.getState().move(0, 1);

    const first = store.getState().save();
    await assert.rejects(store.getState().save(), /already in progress/);
    assert.equal(store.getState().move(0, 1), false); // moves blocked too
    release();
    await first;
    assert.equal(store.getState().saving, false);
    assert.ok(state);
  });

  test("a stale response never overwrites a newer selection", async () => {
    const { store, api } = setup();
    const pending = {};
    api.fetchList = (languageId) =>
      new Promise((r) => (pending[languageId || "global"] = r));

    const slow = store.getState().fetch(EN);
    const fast = store.getState().fetch(ML);
    pending[ML]([pop("m1", ML)]);
    await fast;
    pending[EN]([pop("e1", EN)]); // arrives late
    await slow;

    const s = store.getState();
    assert.equal(s.languageId, ML);
    assert.deepEqual(ids(s.courses), ["m1"]);
  });

  test("fetch error sets error state; retry fetch recovers", async () => {
    const { store, api } = setup();
    const real = api.fetchList;
    api.fetchList = async () => {
      throw new Error("500");
    };
    await store.getState().fetch(EN);
    assert.equal(store.getState().status, "error");
    api.fetchList = real;
    await store.getState().fetch(EN);
    assert.equal(store.getState().status, "ready");
  });

  test("empty popular list is ready with no courses", async () => {
    const backend = fakeBackend([]);
    const store = createStore(createPopularOrderSlice(backend.api));
    await store.getState().fetch("lang-none");
    assert.equal(store.getState().status, "ready");
    assert.deepEqual(store.getState().courses, []);
  });

  test("rejects unexpected response shape", async () => {
    const store = createStore(
      createPopularOrderSlice({ fetchList: async () => ({ courses: [] }), saveOrder: async () => {} })
    );
    await store.getState().fetch(null);
    assert.equal(store.getState().status, "error");
  });

  test("patchThumbnail updates draft and saved lists", async () => {
    const { store } = setup();
    await store.getState().fetch(EN);
    store.getState().patchThumbnail("e1", "new.png");
    const s = store.getState();
    assert.equal(s.courses[0].thumbnail, "new.png");
    assert.equal(s.lastSaved[0].thumbnail, "new.png");
  });
});
