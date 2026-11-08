import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { fetchAllPages, pageItems, MAX_PAGES } from "../src/services/paginate.js";

const make = (n, start = 0) =>
  Array.from({ length: n }, (_, i) => ({ id: `c${start + i}` }));

// Mirrors GET /admin/courses: { data: { items, pagination } }, 20 per page.
const pagedBackend = (total, limit = 20) => {
  const all = make(total);
  const calls = [];
  const fetchPage = async (page) => {
    calls.push(page);
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      data: {
        items: all.slice((page - 1) * limit, page * limit),
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  };
  return { fetchPage, calls };
};

describe("pageItems", () => {
  test("reads data array, data.items and data.courses", () => {
    assert.deepEqual(pageItems({ data: [1] }), [1]);
    assert.deepEqual(pageItems({ data: { items: [2] } }), [2]);
    assert.deepEqual(pageItems({ data: { courses: [3] } }), [3]);
    assert.equal(pageItems({ data: {} }), null);
  });
});

describe("fetchAllPages", () => {
  test("26 courses over 2 pages -> all 26, 2 requests", async () => {
    const { fetchPage, calls } = pagedBackend(26);
    const items = await fetchAllPages(fetchPage);
    assert.equal(items.length, 26);
    assert.deepEqual(calls, [1, 2]);
    assert.equal(items[25].id, "c25");
  });

  test("single page stops after one request", async () => {
    const { fetchPage, calls } = pagedBackend(5);
    assert.equal((await fetchAllPages(fetchPage)).length, 5);
    assert.deepEqual(calls, [1]);
  });

  test("empty list", async () => {
    const { fetchPage, calls } = pagedBackend(0);
    assert.deepEqual(await fetchAllPages(fetchPage), []);
    assert.deepEqual(calls, [1]);
  });

  test("old non-paginated shape { data: [...] } still works", async () => {
    let n = 0;
    const items = await fetchAllPages(async () => {
      n++;
      return { data: make(3) };
    });
    assert.equal(items.length, 3);
    assert.equal(n, 1);
  });

  test("uses totalPages when hasNextPage is missing", async () => {
    const calls = [];
    const items = await fetchAllPages(async (page) => {
      calls.push(page);
      return { data: { items: make(2, page * 10), pagination: { page, totalPages: 3 } } };
    });
    assert.equal(items.length, 6);
    assert.deepEqual(calls, [1, 2, 3]);
  });

  test("skips duplicates if a course shifts between pages", async () => {
    const pages = {
      1: { data: { items: [{ id: "a" }, { id: "b" }], pagination: { hasNextPage: true } } },
      2: { data: { items: [{ id: "b" }, { id: "c" }], pagination: { hasNextPage: false } } },
    };
    const items = await fetchAllPages(async (p) => pages[p]);
    assert.deepEqual(items.map((i) => i.id), ["a", "b", "c"]);
  });

  test("stops on an empty page even if hasNextPage is wrongly true", async () => {
    const calls = [];
    await fetchAllPages(async (page) => {
      calls.push(page);
      return { data: { items: [], pagination: { hasNextPage: true } } };
    });
    assert.deepEqual(calls, [1]);
  });

  test("never loops forever", async () => {
    let n = 0;
    await fetchAllPages(async (page) => {
      n++;
      return { data: { items: [{ id: `x${page}` }], pagination: { hasNextPage: true } } };
    });
    assert.equal(n, MAX_PAGES);
  });

  test("unexpected shape throws (store shows the error state)", async () => {
    await assert.rejects(fetchAllPages(async () => ({ data: { foo: 1 } })), /Unexpected/);
  });

  test("a failed page request rejects", async () => {
    await assert.rejects(
      fetchAllPages(async (page) => {
        if (page === 2) throw new Error("500");
        return { data: { items: [{ id: "a" }], pagination: { hasNextPage: true } } };
      }),
      /500/
    );
  });
});
