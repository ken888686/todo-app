"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./db";
import { Prisma } from "./generated/prisma/client";
import { Status } from "./generated/prisma/enums";
import type {
  ItemCreateInput,
  ItemUpdateInput,
} from "./generated/prisma/models";
import {
  getItemPage,
  normalizeItemCursor,
  normalizeItemSearch,
  type ItemViewModel,
  type ItemPage,
} from "./item-query";
import {
  getDefaultItemDueAt,
  isValidItemId,
  isValidItemStatus,
  normalizeItemTitle,
  normalizeItemTitleForComparison,
} from "./item-validation";
import { logServerError } from "./logger";

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
  logServerError(`todo-action.${action}`, error);
}

export async function loadMoreItems(
  search: unknown,
  after: unknown,
): Promise<ActionResult<ItemPage>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (normalizeItemCursor(after) === null) {
      return { success: false, error: "Invalid item cursor" };
    }

    return {
      success: true,
      data: await getItemPage(
        session.user.id,
        normalizeItemSearch(search),
        after,
      ),
    };
  } catch (error) {
    reportActionError("loadMoreItems", error);
    return { success: false, error: "Failed to load more items" };
  }
}

export async function addItem(
  title: unknown,
): Promise<ActionResult<ItemViewModel>> {
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
      select: {
        id: true,
        title: true,
        normalizedTitle: true,
        status: true,
        dueAt: true,
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
      updateData.dueAt = getDefaultItemDueAt();
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
