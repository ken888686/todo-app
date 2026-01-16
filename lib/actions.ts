"use server";
import { revalidatePath } from "next/cache";
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
    if (!title || title.trim().length === 0) {
      return { success: false, error: "Title cannot be empty" };
    }

    const itemData: ItemCreateInput = {
      title,
      status: Status.PENDING,
    };
    const newItem = await prisma.item.create({ data: itemData });
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
    const updateData: ItemUpdateInput = {
      status,
    };

    if (status === Status.PENDING) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      updateData.expiredAt = tomorrow;
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/");
    return { success: true, data: updatedItem };
  } catch (e) {
    const error =
      e instanceof Error ? e.message : "Failed to update item status";
    return { success: false, error };
  }
}

export async function deleteItem(id: number): Promise<ActionResult<ItemModel>> {
  try {
    const deletedItem = await prisma.item.delete({ where: { id } });
    revalidatePath("/");
    return { success: true, data: deletedItem };
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
    if (!title || title.trim().length === 0) {
      return { success: false, error: "Title cannot be empty" };
    }
    const updatedItem = await prisma.item.update({
      where: { id },
      data: { title },
    });
    revalidatePath("/");
    return { success: true, data: updatedItem };
  } catch (e) {
    const error =
      e instanceof Error ? e.message : "Failed to update item title";
    return { success: false, error };
  }
}
