// Pure helpers for the published-course display order. No React, no network,
// so they can be tested in isolation.

/**
 * Returns a new array with the item at `from` moved to `to`.
 * Out-of-range or no-op moves return the original array.
 * @template T
 * @param {T[]} list
 * @param {number} from
 * @param {number} to
 * @returns {T[]}
 */
export function moveItem(list, from, to) {
  if (
    !Array.isArray(list) ||
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= list.length ||
    to >= list.length
  ) {
    return list;
  }
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Checks that `nextList` is a complete, duplicate-free permutation of the
 * last-saved published ids and contains only PUBLISHED courses.
 * When `languageId` is given, every course must belong to that language.
 * @param {{id: string, status?: string, languageId?: string}[]} nextList
 * @param {string[]} savedIds
 * @param {string|null} [languageId]
 * @returns {{ ok: true, ids: string[] } | { ok: false, reason: string }}
 */
export function validateOrder(nextList, savedIds, languageId = null) {
  if (!Array.isArray(nextList) || !Array.isArray(savedIds)) {
    return { ok: false, reason: "Course order is unavailable." };
  }

  const ids = nextList.map((c) => c?.id);

  if (ids.some((id) => typeof id !== "string" || !id)) {
    return { ok: false, reason: "Course order contains an invalid course." };
  }
  if (nextList.some((c) => c.status && c.status !== "PUBLISHED")) {
    return { ok: false, reason: "Only published courses can be ordered." };
  }
  if (languageId && nextList.some((c) => c.languageId !== languageId)) {
    return {
      ok: false,
      reason: "Course order contains courses from another language.",
    };
  }
  if (new Set(ids).size !== ids.length) {
    return { ok: false, reason: "Course order contains duplicate courses." };
  }
  if (ids.length !== savedIds.length) {
    return {
      ok: false,
      reason: "Course order is incomplete. Reload the list and try again.",
    };
  }
  const saved = new Set(savedIds);
  if (ids.some((id) => !saved.has(id))) {
    return {
      ok: false,
      reason: "Published courses changed. Reload the list and try again.",
    };
  }
  return { ok: true, ids };
}

/**
 * validateOrder plus: every course must be marked popular. Courses without
 * an `isPopular` field are allowed (the backend still re-validates).
 * validateOrder itself is unchanged.
 */
export function validatePopularOrder(nextList, savedIds, languageId = null) {
  if (Array.isArray(nextList) && nextList.some((c) => c?.isPopular === false)) {
    return { ok: false, reason: "Only popular courses can be ordered here." };
  }
  return validateOrder(nextList, savedIds, languageId);
}

/**
 * Sorts by displayOrder ascending; courses without one keep their API order
 * at the end.
 */
export function sortByDisplayOrder(list) {
  return (list || [])
    .map((c, i) => ({ c, i }))
    .sort((a, b) => {
      const ao = Number.isFinite(a.c?.displayOrder) ? a.c.displayOrder : Infinity;
      const bo = Number.isFinite(b.c?.displayOrder) ? b.c.displayOrder : Infinity;
      return ao === bo ? a.i - b.i : ao - bo;
    })
    .map(({ c }) => c);
}

/** True when two course lists have the same ids in the same order. */
export function sameOrder(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  return a.every((c, i) => c?.id === b[i]?.id);
}
