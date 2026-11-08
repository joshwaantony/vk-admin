import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  ALL_LANGUAGES,
  countByStatus,
  courseLanguageId,
  filterCourses,
  getLanguageOptions,
  matchesLanguage,
} from "../src/components/Course/CourseList/courseFilters.js";

const EN = { id: "lang-en", code: "ENGLISH", name: "english" };
const ML = { id: "lang-ml", code: "MALAYALAM", name: "malayalam" };

const course = (id, title, language, extra = {}) => ({
  id,
  title,
  languageId: language?.id,
  language,
  price: 100,
  status: "DRAFT",
  displayOrder: 0,
  totalVideos: 0,
  ...extra,
});

// Shape mirrors GET /admin/courses.
const COURSES = [
  course("c1", "vyg", EN, { status: "PUBLISHED", displayOrder: 2, price: 1234, totalVideos: 1 }),
  course("c2", "demo1", EN, { status: "PUBLISHED", displayOrder: 1, price: 3000, totalVideos: 1 }),
  course("c3", "ererer", EN, { price: 2000 }),
  course("c4", "dfghj", ML, { price: 234 }),
  course("c5", "Malayalam Basics", ML, { status: "PUBLISHED", displayOrder: 1, price: 500, totalVideos: 4 }),
  course("c6", "Old course", ML, { status: "ARCHIVED" }),
];

const ids = (list) => list.map((c) => c.id);

describe("courseLanguageId", () => {
  test("reads languageId", () => {
    assert.equal(courseLanguageId({ languageId: "x" }), "x");
  });
  test("falls back to nested language.id", () => {
    assert.equal(courseLanguageId({ language: { id: "y" } }), "y");
  });
  test("returns null when the course has no language", () => {
    assert.equal(courseLanguageId({}), null);
    assert.equal(courseLanguageId(null), null);
  });
});

describe("getLanguageOptions", () => {
  test("returns each language once, sorted by name", () => {
    assert.deepEqual(getLanguageOptions(COURSES), [
      { id: "lang-en", name: "english" },
      { id: "lang-ml", name: "malayalam" },
    ]);
  });
  test("skips courses without a language", () => {
    assert.deepEqual(getLanguageOptions([{ id: "x", title: "no lang" }]), []);
  });
  test("uses 'Unknown' when only languageId is present", () => {
    assert.deepEqual(getLanguageOptions([{ id: "x", languageId: "lang-zz" }]), [
      { id: "lang-zz", name: "Unknown" },
    ]);
  });
  test("handles empty / missing input", () => {
    assert.deepEqual(getLanguageOptions([]), []);
    assert.deepEqual(getLanguageOptions(undefined), []);
  });
});

describe("matchesLanguage", () => {
  test("'all' matches every course", () => {
    assert.ok(matchesLanguage(COURSES[0], ALL_LANGUAGES));
    assert.ok(matchesLanguage({ id: "x" }, ALL_LANGUAGES));
  });
  test("matches only the selected language", () => {
    assert.ok(matchesLanguage(COURSES[0], "lang-en"));
    assert.ok(!matchesLanguage(COURSES[0], "lang-ml"));
  });
});

describe("countByStatus", () => {
  test("counts all languages by default", () => {
    assert.deepEqual(countByStatus(COURSES), { DRAFT: 2, PUBLISHED: 3, ARCHIVED: 1 });
  });
  test("counts follow the language filter", () => {
    assert.deepEqual(countByStatus(COURSES, "lang-en"), { DRAFT: 1, PUBLISHED: 2, ARCHIVED: 0 });
    assert.deepEqual(countByStatus(COURSES, "lang-ml"), { DRAFT: 1, PUBLISHED: 1, ARCHIVED: 1 });
  });
  test("ignores unknown statuses", () => {
    assert.deepEqual(countByStatus([{ id: "x", status: "WEIRD" }]), {
      DRAFT: 0,
      PUBLISHED: 0,
      ARCHIVED: 0,
    });
  });
});

describe("filterCourses", () => {
  test("filters by status", () => {
    assert.deepEqual(ids(filterCourses(COURSES, { status: "DRAFT" })), ["c3", "c4"]);
  });

  test("filters by status and language together", () => {
    assert.deepEqual(
      ids(filterCourses(COURSES, { status: "PUBLISHED", languageId: "lang-ml" })),
      ["c5"]
    );
    assert.deepEqual(
      ids(filterCourses(COURSES, { status: "DRAFT", languageId: "lang-en" })),
      ["c3"]
    );
  });

  test("language with no courses in that status returns empty", () => {
    assert.deepEqual(filterCourses(COURSES, { status: "ARCHIVED", languageId: "lang-en" }), []);
  });

  test("search is case-insensitive and trimmed", () => {
    assert.deepEqual(
      ids(filterCourses(COURSES, { status: "PUBLISHED", search: "  MALAYALAM " })),
      ["c5"]
    );
  });

  test("search combines with the language filter", () => {
    assert.deepEqual(
      filterCourses(COURSES, { status: "PUBLISHED", languageId: "lang-en", search: "malayalam" }),
      []
    );
  });

  test("published default sort follows displayOrder", () => {
    assert.deepEqual(
      ids(filterCourses(COURSES, { status: "PUBLISHED", languageId: "lang-en" })),
      ["c2", "c1"]
    );
  });

  test("explicit sorts override display order", () => {
    const opts = { status: "PUBLISHED" };
    assert.deepEqual(ids(filterCourses(COURSES, { ...opts, sort: "title-asc" })), ["c2", "c5", "c1"]);
    assert.deepEqual(ids(filterCourses(COURSES, { ...opts, sort: "price-desc" })), ["c2", "c1", "c5"]);
    assert.deepEqual(ids(filterCourses(COURSES, { ...opts, sort: "price-asc" })), ["c5", "c1", "c2"]);
    assert.deepEqual(ids(filterCourses(COURSES, { ...opts, sort: "videos-desc" }))[0], "c5");
  });

  test("does not mutate the input list", () => {
    const before = ids(COURSES);
    filterCourses(COURSES, { status: "PUBLISHED", sort: "title-desc" });
    assert.deepEqual(ids(COURSES), before);
  });

  test("handles missing input", () => {
    assert.deepEqual(filterCourses(undefined, { status: "DRAFT" }), []);
  });

  test("never throws on a non-array (unexpected API shape)", () => {
    const bad = { courses: COURSES, pagination: {} };
    assert.deepEqual(filterCourses(bad, { status: "DRAFT" }), []);
    assert.deepEqual(getLanguageOptions(bad), []);
    assert.deepEqual(countByStatus(bad), { DRAFT: 0, PUBLISHED: 0, ARCHIVED: 0 });
    assert.deepEqual(getLanguageOptions("oops"), []);
  });
});
