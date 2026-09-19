import assert from "node:assert/strict";
import test from "node:test";
import {
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
