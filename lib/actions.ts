"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { Status } from "./generated/prisma/enums";
import {
  ItemCreateInput,
  ItemUncheckedUpdateInput,
  ItemUpdateInput,
} from "./generated/prisma/models";

export async function addItem(newItem: ItemCreateInput) {
  await prisma.item.create({ data: newItem });
  revalidatePath("/");
}

export async function updateItemStatus(newItem: ItemUncheckedUpdateInput) {
  const updateData: ItemUpdateInput = {
    status: newItem.status,
  };

  if (newItem.status === Status.PENDING) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    updateData.expiredAt = tomorrow;
  }

  await prisma.item.update({
    where: { id: newItem.id as number },
    data: updateData,
  });
  revalidatePath("/");
}

export async function deleteItem(id: number) {
  await prisma.item.delete({ where: { id } });
  revalidatePath("/");
}

export async function updateItemTitle(id: number, title: string) {
  await prisma.item.update({
    where: { id },
    data: { title },
  });
  revalidatePath("/");
}
