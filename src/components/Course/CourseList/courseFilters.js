// Pure filtering / sorting helpers for the Course Management list.
// No React, no network, so they can be tested in isolation (see tests/).
import { sortByDisplayOrder } from "./reorder.js";

export const ALL_LANGUAGES = "all";

export const SORTERS = {
  "title-asc": (a, b) => (a.title || "").localeCompare(b.title || ""),
  "title-desc": (a, b) => (b.title || "").localeCompare(a.title || ""),
  "price-asc": (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0),
  "price-desc": (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0),
  "videos-desc": (a, b) =>
    (Number(b.totalVideos) || 0) - (Number(a.totalVideos) || 0),
};

// Never throw on a non-array (e.g. an unexpected API response shape).
const asArray = (value) => (Array.isArray(value) ? value : []);

/** Language id of a course, from `languageId` or the nested `language`. */
export const courseLanguageId = (course) =>
  course?.languageId || course?.language?.id || null;

/**
 * Unique languages present in the course list, sorted by name.
 * @returns {{id: string, name: string}[]}
 */
export function getLanguageOptions(courses) {
  const map = new Map();
  asArray(courses).forEach((c) => {
    const id = courseLanguageId(c);
    if (id && !map.has(id)) map.set(id, c.language?.name || "Unknown");
  });
  return [...map]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** True when the course belongs to `languageId` (or the filter is "all"). */
export function matchesLanguage(course, languageId) {
  return (
    !languageId ||
    languageId === ALL_LANGUAGES ||
    courseLanguageId(course) === languageId
  );
}

/** Course counts per status, limited to the selected language. */
export function countByStatus(courses, languageId = ALL_LANGUAGES) {
  const counts = { DRAFT: 0, PUBLISHED: 0, ARCHIVED: 0 };
  asArray(courses).forEach((c) => {
    if (matchesLanguage(c, languageId) && counts[c.status] !== undefined) {
      counts[c.status] += 1;
    }
  });
  return counts;
}

/**
 * Applies status, language and title search, then sorting.
 * With the "default" sort, published courses follow their display order.
 */
export function filterCourses(
  courses,
  { status, languageId = ALL_LANGUAGES, search = "", sort = "default" } = {}
) {
  const q = search.trim().toLowerCase();
  let list = asArray(courses).filter(
    (c) =>
      (!status || c.status === status) &&
      matchesLanguage(c, languageId) &&
      (!q || (c.title || "").toLowerCase().includes(q))
  );
  if (SORTERS[sort]) list = [...list].sort(SORTERS[sort]);
  else if (status === "PUBLISHED") list = sortByDisplayOrder(list);
  return list;
}
