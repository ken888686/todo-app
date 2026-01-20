"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./db";
import { Status } from "./generated/prisma/enums";
import {
  ItemCreateInput,
  ItemModel,
  ItemUpdateInput,
} from "./generated/prisma/models";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function addItem(title: string): Promise<ActionResult<ItemModel>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!title || title.trim().length === 0) {
      return { success: false, error: "Title cannot be empty" };
    }

    const itemData: Omit<ItemCreateInput, "user"> = {
      title,
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
  } catch (e) {
    const error = e instanceof Error ? e.message : "Failed to create item";
    return { success: false, error };
  }
}

export async function updateItemStatus(
  id: number,
  status: Status,
): Promise<ActionResult<ItemModel>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const updateData: ItemUpdateInput = {
      status,
    };

    if (status === Status.PENDING) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      updateData.expiredAt = tomorrow;
    }

    const { count } = await prisma.item.updateMany({
      where: { id, userId: session.user.id },
      data: updateData,
    });

    if (count === 0) {
      return { success: false, error: "Item not found or permission denied." };
    }

    revalidatePath("/");
    return { success: true, data: {} as ItemModel };
  } catch (e) {
    const error =
      e instanceof Error ? e.message : "Failed to update item status";
    return { success: false, error };
  }
}

export async function deleteItem(id: number): Promise<ActionResult<ItemModel>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const { count } = await prisma.item.deleteMany({
      where: { id, userId: session.user.id },
    });

    if (count === 0) {
      return { success: false, error: "Item not found or permission denied." };
    }

    revalidatePath("/");
    return { success: true, data: {} as ItemModel };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Failed to delete item";
    return { success: false, error };
  }
}

export async function updateItemTitle(
  id: number,
  title: string,
): Promise<ActionResult<ItemModel>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!title || title.trim().length === 0) {
      return { success: false, error: "Title cannot be empty" };
    }
    const { count } = await prisma.item.updateMany({
      where: { id, userId: session.user.id },
      data: { title },
    });

    if (count === 0) {
      return { success: false, error: "Item not found or permission denied." };
    }

    revalidatePath("/");
    return { success: true, data: {} as ItemModel };
  } catch (e) {
    const error =
      e instanceof Error ? e.message : "Failed to update item title";
    return { success: false, error };
  }
}
