// Pure helpers for popular-course ordering. No React, no network, so they
// can be tested in isolation (see tests/popularOrder.test.mjs).
//
// Backend contract (popular ordering):
//   GET /admin/courses/popular                    -> global popular order
//   GET /admin/courses/popular?languageId=<uuid>  -> that language's order
//   PUT /admin/courses/popular/reorder/global     { courseIds }
//   PUT /admin/courses/popular/reorder            { languageId, courseIds }
// Global and per-language orders are stored in separate fields, so each
// save only ever targets one scope.

export const POPULAR_REORDER_GLOBAL_URL = "/admin/courses/popular/reorder/global";
export const POPULAR_REORDER_LANGUAGE_URL = "/admin/courses/popular/reorder";

/**
 * Extracts the course array from a GET /admin/courses/popular response body.
 * Accepts `{ data: [...] }` and `{ data: { courses: [...] } }`.
 * Returns null when the shape is not recognised.
 */
export function extractPopularList(body) {
  const data = body?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.courses)) return data.courses;
  return null;
}

/**
 * Builds the reorder request for one scope. A languageId targets that
 * language's order only; no languageId targets the global order only.
 * @returns {{ url: string, body: object }}
 */
export function buildPopularReorderRequest(courseIds, languageId = null) {
  return languageId
    ? { url: POPULAR_REORDER_LANGUAGE_URL, body: { languageId, courseIds } }
    : { url: POPULAR_REORDER_GLOBAL_URL, body: { courseIds } };
}
