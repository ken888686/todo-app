"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./db";
import { Status } from "./generated/prisma/enums";
import type {
  ItemCreateInput,
  ItemModel,
  ItemUpdateInput,
} from "./generated/prisma/models";
import {
  isValidItemId,
  isValidItemStatus,
  normalizeItemTitle,
} from "./item-validation";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

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

    const itemData: Omit<ItemCreateInput, "user"> = {
      title: titleResult.value,
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
  } catch {
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
  } catch {
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
  } catch {
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
    const { count } = await prisma.item.updateMany({
      where: { id, userId: session.user.id },
      data: { title: titleResult.value },
    });

    if (count === 0) {
      return { success: false, error: "Item not found or permission denied." };
    }

    revalidatePath("/");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to update item title" };
  }
}
