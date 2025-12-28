"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import {
  ItemCreateInput,
  ItemUncheckedUpdateInput,
} from "./generated/prisma/models";

export async function addItem(newItem: ItemCreateInput) {
  await prisma.item.create({ data: newItem });
  revalidatePath("/");
}

export async function updateItemStatus(newItem: ItemUncheckedUpdateInput) {
  await prisma.item.update({
    where: { id: newItem.id as number },
    data: { status: newItem.status },
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
