import type { ItemModel } from "./generated/prisma/models";
import { prisma } from "./db";

export const ITEM_PAGE_SIZE = 100;
export const MAX_ITEM_SEARCH_LENGTH = 200;

export type ItemPage = {
  items: ItemModel[];
  hasMore: boolean;
};

export function normalizeItemSearch(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, MAX_ITEM_SEARCH_LENGTH);
}

export function normalizeItemPage(value: unknown) {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    return null;
  }

  return value >= 0 ? value : null;
}

export async function getItemPage(
  userId: string,
  search: unknown,
  page = 0,
): Promise<ItemPage> {
  const normalizedSearch = normalizeItemSearch(search);
  const normalizedPage = normalizeItemPage(page) ?? 0;
  const items = await prisma.item.findMany({
    where: {
      userId,
      ...(normalizedSearch
        ? {
            title: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          }
        : {}),
    },
    orderBy: [
      { status: "asc" },
      { title: "asc" },
      { createdAt: "desc" },
      { id: "desc" },
    ],
    skip: normalizedPage * ITEM_PAGE_SIZE,
    take: ITEM_PAGE_SIZE + 1,
  });

  return {
    items: items.slice(0, ITEM_PAGE_SIZE),
    hasMore: items.length > ITEM_PAGE_SIZE,
  };
}
