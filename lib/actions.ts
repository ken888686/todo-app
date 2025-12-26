"use server";
import {
  ItemCreateInput,
  ItemUncheckedUpdateInput,
} from "@/app/generated/prisma/models";
import { revalidatePath } from "next/cache";
import { prisma } from "./db";

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
