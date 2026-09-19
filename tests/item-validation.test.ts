import assert from "node:assert/strict";
import test from "node:test";
import {
  getDefaultItemDueAt,
  isValidItemId,
  isValidItemStatus,
  normalizeItemTitle,
  normalizeItemTitleForComparison,
} from "../lib/item-validation";

test("normalizes valid item titles", () => {
  assert.deepEqual(normalizeItemTitle("  Buy milk  "), {
    success: true,
    value: "Buy milk",
  });
});

test("rejects empty and overlong item titles", () => {
  assert.equal(normalizeItemTitle("   ").success, false);
  assert.equal(normalizeItemTitle("a".repeat(201)).success, false);
});

test("normalizes item titles for duplicate comparisons", () => {
  assert.equal(normalizeItemTitleForComparison("  Buy MILK  "), "buy milk");
  assert.equal(normalizeItemTitleForComparison("  İTEM  "), "i̇tem");
});

test("creates a due date exactly one day after the reference time", () => {
  const reference = new Date("2026-09-19T12:00:00.000Z");
  assert.equal(
    getDefaultItemDueAt(reference).toISOString(),
    "2026-09-20T12:00:00.000Z",
  );
});

test("validates item ids", () => {
  assert.equal(isValidItemId(1), true);
  assert.equal(isValidItemId(0), false);
  assert.equal(isValidItemId(1.5), false);
  assert.equal(isValidItemId("1"), false);
});

test("validates item statuses", () => {
  assert.equal(isValidItemStatus("PENDING"), true);
  assert.equal(isValidItemStatus("DONE"), true);
  assert.equal(isValidItemStatus("ARCHIVED"), false);
});
