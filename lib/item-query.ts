import { Status } from "./generated/prisma/enums";
import type { ItemModel } from "./generated/prisma/models";
import { prisma } from "./db";

export const ITEM_PAGE_SIZE = 100;
export const MAX_ITEM_SEARCH_LENGTH = 200;

export type ItemViewModel = Pick<
  ItemModel,
  "id" | "title" | "normalizedTitle" | "status" | "dueAt"
>;

export type ItemCursor = {
  status: Status;
  title: string;
  createdAt: Date;
  id: number;
};

export type ItemPage = {
  items: ItemViewModel[];
  hasMore: boolean;
  nextCursor: string | null;
};

export function normalizeItemSearch(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, MAX_ITEM_SEARCH_LENGTH);
}

function encodeCursor(
  item: Pick<ItemModel, "status" | "title" | "createdAt" | "id">,
) {
  return Buffer.from(
    JSON.stringify({
      status: item.status,
      title: item.title,
      createdAt: item.createdAt.toISOString(),
      id: item.id,
    }),
  ).toString("base64url");
}

export function normalizeItemCursor(value: unknown): ItemCursor | null {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as Partial<Record<keyof ItemCursor, unknown>>;

    if (
      (parsed.status !== Status.PENDING && parsed.status !== Status.DONE) ||
      typeof parsed.title !== "string" ||
      typeof parsed.createdAt !== "string" ||
      typeof parsed.id !== "number" ||
      !Number.isSafeInteger(parsed.id) ||
      parsed.id <= 0
    ) {
      return null;
    }

    const createdAt = new Date(parsed.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      return null;
    }

    return {
      status: parsed.status,
      title: parsed.title,
      createdAt,
      id: parsed.id,
    };
  } catch {
    return null;
  }
}

export async function getItemPage(
  userId: string,
  search: unknown,
  after: unknown = null,
): Promise<ItemPage> {
  const normalizedSearch = normalizeItemSearch(search);
  const cursor = normalizeItemCursor(after);
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
      ...(cursor
        ? {
            OR: [
              ...(cursor.status === Status.PENDING
                ? [{ status: Status.DONE }]
                : []),
              {
                status: cursor.status,
                title: { gt: cursor.title },
              },
              {
                status: cursor.status,
                title: cursor.title,
                createdAt: { lt: cursor.createdAt },
              },
              {
                status: cursor.status,
                title: cursor.title,
                createdAt: cursor.createdAt,
                id: { lt: cursor.id },
              },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      normalizedTitle: true,
      status: true,
      dueAt: true,
      createdAt: true,
    },
    orderBy: [
      { status: "asc" },
      { title: "asc" },
      { createdAt: "desc" },
      { id: "desc" },
    ],
    take: ITEM_PAGE_SIZE + 1,
  });

  const pageItems = items.slice(0, ITEM_PAGE_SIZE).map((row) => {
    const { createdAt, ...item } = row;
    void createdAt;
    return item;
  });
  const hasMore = items.length > ITEM_PAGE_SIZE;
  const lastItem = items.at(ITEM_PAGE_SIZE - 1);

  return {
    items: pageItems,
    hasMore,
    nextCursor: hasMore && lastItem ? encodeCursor(lastItem) : null,
  };
}
