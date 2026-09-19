export const MAX_ITEM_TITLE_LENGTH = 200;

export type ValidationResult<T> =
  | { success: true; value: T }
  | { success: false; error: string };

export function normalizeItemTitle(value: unknown): ValidationResult<string> {
  if (typeof value !== "string") {
    return { success: false, error: "Title must be a string" };
  }

  const title = value.trim();

  if (title.length === 0) {
    return { success: false, error: "Title cannot be empty" };
  }

  if (title.length > MAX_ITEM_TITLE_LENGTH) {
    return {
      success: false,
      error: `Title cannot exceed ${MAX_ITEM_TITLE_LENGTH} characters`,
    };
  }

  return { success: true, value: title };
}

export function normalizeItemTitleForComparison(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function isValidItemId(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

export function isValidItemStatus(value: unknown): value is "PENDING" | "DONE" {
  return value === "PENDING" || value === "DONE";
}
