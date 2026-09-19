"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./db";
import { Prisma } from "./generated/prisma/client";
import { Status } from "./generated/prisma/enums";
import type {
  ItemCreateInput,
  ItemModel,
  ItemUpdateInput,
} from "./generated/prisma/models";
import {
  getItemPage,
  normalizeItemPage,
  normalizeItemSearch,
  type ItemPage,
} from "./item-query";
import {
  isValidItemId,
  isValidItemStatus,
  normalizeItemTitle,
  normalizeItemTitleForComparison,
} from "./item-validation";

type ActionResult<T> =
  { success: true; data: T } | { success: false; error: string };

const DUPLICATE_ITEM_ERROR = "A todo with this title already exists";

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function reportActionError(action: string, error: unknown) {
  console.error(`[todo-action:${action}]`, error);
}

export async function loadMoreItems(
  search: unknown,
  page: unknown,
): Promise<ActionResult<ItemPage>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const normalizedPage = normalizeItemPage(page);
    if (normalizedPage === null || normalizedPage === 0) {
      return { success: false, error: "Invalid item page" };
    }

    return {
      success: true,
      data: await getItemPage(
        session.user.id,
        normalizeItemSearch(search),
        normalizedPage,
      ),
    };
  } catch (error) {
    reportActionError("loadMoreItems", error);
    return { success: false, error: "Failed to load more items" };
  }
}

export async function addItem(
  title: unknown,
): Promise<ActionResult<ItemModel>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const titleResult = normalizeItemTitle(title);
    if (!titleResult.success) {
      return titleResult;
    }

    const normalizedTitle = normalizeItemTitleForComparison(titleResult.value);
    const existingItem = await prisma.item.findFirst({
      where: {
        userId: session.user.id,
        normalizedTitle,
      },
      select: { id: true },
    });

    if (existingItem) {
      return { success: false, error: DUPLICATE_ITEM_ERROR };
    }

    const itemData: Omit<ItemCreateInput, "user"> = {
      title: titleResult.value,
      normalizedTitle,
      status: Status.PENDING,
    };
    const newItem = await prisma.item.create({
      data: {
        ...itemData,
        userId: session.user.id,
      },
    });
    revalidatePath("/");
    return { success: true, data: newItem };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { success: false, error: DUPLICATE_ITEM_ERROR };
    }
    reportActionError("addItem", error);
    return { success: false, error: "Failed to create item" };
  }
}

export async function updateItemStatus(
  id: unknown,
  status: unknown,
): Promise<ActionResult<void>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!isValidItemId(id)) {
      return { success: false, error: "Invalid item id" };
    }

    if (!isValidItemStatus(status)) {
      return { success: false, error: "Invalid item status" };
    }

    const updateData: ItemUpdateInput = {
      status: status === Status.DONE ? Status.DONE : Status.PENDING,
    };

    if (status === Status.PENDING) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      updateData.dueAt = tomorrow;
    }

    const { count } = await prisma.item.updateMany({
      where: { id, userId: session.user.id },
      data: updateData,
    });

    if (count === 0) {
      return { success: false, error: "Item not found or permission denied." };
    }

    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    reportActionError("updateItemStatus", error);
    return { success: false, error: "Failed to update item status" };
  }
}

export async function deleteItem(id: unknown): Promise<ActionResult<void>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!isValidItemId(id)) {
      return { success: false, error: "Invalid item id" };
    }

    const { count } = await prisma.item.deleteMany({
      where: { id, userId: session.user.id },
    });

    if (count === 0) {
      return { success: false, error: "Item not found or permission denied." };
    }

    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    reportActionError("deleteItem", error);
    return { success: false, error: "Failed to delete item" };
  }
}

export async function updateItemTitle(
  id: unknown,
  title: unknown,
): Promise<ActionResult<void>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!isValidItemId(id)) {
      return { success: false, error: "Invalid item id" };
    }

    const titleResult = normalizeItemTitle(title);
    if (!titleResult.success) {
      return titleResult;
    }
    const normalizedTitle = normalizeItemTitleForComparison(titleResult.value);
    const existingItem = await prisma.item.findFirst({
      where: {
        userId: session.user.id,
        normalizedTitle,
        id: { not: id },
      },
      select: { id: true },
    });

    if (existingItem) {
      return { success: false, error: DUPLICATE_ITEM_ERROR };
    }

    const { count } = await prisma.item.updateMany({
      where: { id, userId: session.user.id },
      data: { title: titleResult.value, normalizedTitle },
    });

    if (count === 0) {
      return { success: false, error: "Item not found or permission denied." };
    }

    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { success: false, error: DUPLICATE_ITEM_ERROR };
    }
    reportActionError("updateItemTitle", error);
    return { success: false, error: "Failed to update item title" };
  }
}
