// Fetches every page of a paginated list endpoint and returns all items.
// No React / axios here, so it can be tested in isolation (tests/paginate.test.mjs).
//
// Supported response bodies:
//   { data: [...] }                                   (not paginated)
//   { data: { items: [...], pagination: {...} } }
//   { data: { courses: [...], pagination: {...} } }
// pagination: { page, totalPages, hasNextPage }

export const MAX_PAGES = 50; // safety stop against a misbehaving backend

export const pageItems = (body) => {
  const data = body?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.courses)) return data.courses;
  return null;
};

const hasMore = (body, page, received) => {
  const p = body?.data?.pagination;
  if (!p || received === 0) return false;
  if (typeof p.hasNextPage === "boolean") return p.hasNextPage;
  if (Number.isFinite(p.totalPages)) return page < p.totalPages;
  return false;
};

/**
 * @param {(page: number) => Promise<object>} fetchPage returns a response body
 * @returns {Promise<object[]>}
 */
export async function fetchAllPages(fetchPage) {
  const all = [];
  const seen = new Set();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const body = await fetchPage(page);
    const items = pageItems(body);
    if (!items) throw new Error("Unexpected list response");
    // Skip duplicates (e.g. a course shifting pages between requests).
    items.forEach((item) => {
      const key = item?.id;
      if (key == null || !seen.has(key)) {
        if (key != null) seen.add(key);
        all.push(item);
      }
    });
    if (!hasMore(body, page, items.length)) break;
  }
  return all;
}
