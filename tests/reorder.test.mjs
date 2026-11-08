import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  moveItem,
  sameOrder,
  sortByDisplayOrder,
  validateOrder,
} from "../src/components/Course/CourseList/reorder.js";

const pub = (id, languageId = "lang-en") => ({ id, status: "PUBLISHED", languageId });

describe("moveItem", () => {
  test("moves an item down and up", () => {
    assert.deepEqual(moveItem(["a", "b", "c"], 0, 2), ["b", "c", "a"]);
    assert.deepEqual(moveItem(["a", "b", "c"], 2, 0), ["c", "a", "b"]);
  });
  test("returns the same array for no-op or out-of-range moves", () => {
    const list = ["a", "b"];
    assert.equal(moveItem(list, 1, 1), list);
    assert.equal(moveItem(list, -1, 0), list);
    assert.equal(moveItem(list, 0, 5), list);
  });
  test("does not mutate the input", () => {
    const list = ["a", "b", "c"];
    moveItem(list, 0, 1);
    assert.deepEqual(list, ["a", "b", "c"]);
  });
});

describe("validateOrder", () => {
  const saved = ["a", "b", "c"];

  test("accepts a full permutation", () => {
    assert.deepEqual(validateOrder([pub("c"), pub("a"), pub("b")], saved), {
      ok: true,
      ids: ["c", "a", "b"],
    });
  });
  test("rejects duplicates", () => {
    assert.equal(validateOrder([pub("a"), pub("a"), pub("b")], saved).ok, false);
  });
  test("rejects a missing course", () => {
    assert.equal(validateOrder([pub("a"), pub("b")], saved).ok, false);
  });
  test("rejects an unknown course", () => {
    assert.equal(validateOrder([pub("a"), pub("b"), pub("z")], saved).ok, false);
  });
  test("rejects non-published courses", () => {
    const list = [pub("a"), pub("b"), { id: "c", status: "DRAFT" }];
    assert.equal(validateOrder(list, saved).ok, false);
  });
  test("rejects courses from another language", () => {
    const list = [pub("a"), pub("b"), pub("c", "lang-ml")];
    assert.equal(validateOrder(list, saved, "lang-en").ok, false);
    assert.equal(validateOrder(list, saved).ok, true); // global order allows mixed
  });
});

describe("sortByDisplayOrder", () => {
  test("sorts ascending and keeps API order for ties / missing values", () => {
    const list = [
      { id: "x" },
      { id: "b", displayOrder: 2 },
      { id: "a", displayOrder: 1 },
      { id: "y" },
    ];
    assert.deepEqual(sortByDisplayOrder(list).map((c) => c.id), ["a", "b", "x", "y"]);
  });
});

describe("sameOrder", () => {
  test("compares ids in order", () => {
    assert.ok(sameOrder([{ id: "a" }, { id: "b" }], [{ id: "a" }, { id: "b" }]));
    assert.ok(!sameOrder([{ id: "a" }, { id: "b" }], [{ id: "b" }, { id: "a" }]));
    assert.ok(!sameOrder([{ id: "a" }], [{ id: "a" }, { id: "b" }]));
  });
});
