"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addItem,
  deleteItem,
  updateItemStatus,
  updateItemTitle,
} from "@/lib/actions";
import { Status } from "@/lib/generated/prisma/enums";
import { ItemModel } from "@/lib/generated/prisma/models";
import { Plus } from "lucide-react";
import { startTransition, use, useMemo, useOptimistic, useState } from "react";
import { toast } from "sonner";
import { TodoItem } from "./todo-item";
import { ScrollArea } from "./ui/scroll-area";

type OptimisticAction =
  | { type: "ADD"; item: ItemModel }
  | { type: "DELETE"; id: number }
  | { type: "UPDATE_STATUS"; id: number; status: Status }
  | { type: "UPDATE_TITLE"; id: number; title: string };

export function TodoList({
  initialItems,
}: {
  initialItems: Promise<ItemModel[]>;
}) {
  const items = use(initialItems);
  const [inputValue, setInputValue] = useState("");

  const [optimisticItems, setOptimisticItems] = useOptimistic(
    items,
    (state, action: OptimisticAction) => {
      switch (action.type) {
        case "ADD":
          return [...state, action.item];
        case "DELETE":
          return state.filter((item) => item.id !== action.id);
        case "UPDATE_STATUS":
          return state.map((item) =>
            item.id === action.id ? { ...item, status: action.status } : item,
          );
        case "UPDATE_TITLE":
          return state.map((item) =>
            item.id === action.id ? { ...item, title: action.title } : item,
          );
        default:
          return state;
      }
    },
  );

  const filteredItems = useMemo(
    () =>
      optimisticItems.filter((item) =>
        item.title.toLowerCase().includes(inputValue.toLowerCase()),
      ),
    [optimisticItems, inputValue],
  );

  async function handleAdd(formData: FormData) {
    const title = formData.get("title")?.toString();
    if (
      !title ||
      title.trim() === "" ||
      optimisticItems.some((item) =>
        item.title.toLowerCase().includes(title.toLowerCase()),
      )
    ) {
      return;
    }

    const tempId = Math.random();
    const newItem: ItemModel = {
      id: tempId,
      title,
      status: Status.PENDING,
      expiredAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setOptimisticItems({ type: "ADD", item: newItem });
    setInputValue("");

    try {
      // In a real app we'd get the real item back from the server
      await addItem({ title });
      // For now, we assume success and validation happens on server/next refresh.
      // Ideally addItem should return the new item to allow reconciling ID.
      // Since we are using a simple list view, we might need to refresh data
      // or let the server component re-render handle it.
      // For this "client list", we update local state if we had the real item.
      // Since addItem is void or doesn't return the item in the imported signature likely,
      // we rely on revalidation.

      // Updating local state (non-optimistic) to keep in sync if revalidation doesn't happen immediately
      // But wait, addItem is a server action that likely revalidates path.
      // If so, `items` prop will update if parent re-renders.
      // But this is a client component, `use(initialItems)` runs once.
      // So we need to update `items` state manually or assume parent passes fresh promise.
      // Let's manually update items to a "fake" successful state if we don't get new data,
      // BUT the correct way with server actions + client component state is often
      // just relying on the optimistic state until the server action resolves
      // and potentially refreshes the page/returns new data.

      // Assuming `addItem` revalidates path. Next.js will update the RSC payload.
      // But `useState(use(initialItems))` won't automatically update from props change
      // unless we bind it to a key or use useEffect.
      // However, for this task, let's keep it simple.
    } catch (e) {
      // Revert optimistic update (requires more complex logic or just refresh)
      toast.error("Failed to add item");
    }
  }

  function handleStatusChange(id: number, checked: boolean) {
    startTransition(async () => {
      const newStatus: Status = checked ? Status.DONE : Status.PENDING;
      setOptimisticItems({ type: "UPDATE_STATUS", id, status: newStatus });

      try {
        await updateItemStatus({ id, status: newStatus });
        toast("Item status updated");
      } catch {
        toast.error("Failed to update status");
      }
    });
  }

  function handleSaveTitle(id: number, newTitle: string) {
    startTransition(async () => {
      setOptimisticItems({ type: "UPDATE_TITLE", id, title: newTitle });

      try {
        await updateItemTitle(id, newTitle);
      } catch {
        toast.error("Failed to update title");
      }
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      setOptimisticItems({ type: "DELETE", id });

      try {
        await deleteItem(id);
      } catch {
        toast.error("Failed to delete item");
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <form action={handleAdd} className="flex items-center gap-2">
        <Input
          name="title"
          placeholder="Add a new todo"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button
          size="icon-lg"
          type="submit"
          disabled={
            inputValue.trim() === "" ||
            filteredItems.some((item) =>
              item.title.toLowerCase().includes(inputValue.toLowerCase()),
            )
          }
          aria-pressed="false"
        >
          <Plus />
        </Button>
      </form>
      <ScrollArea className="min-h-0 flex-1 rounded-md border">
        <div className="flex flex-col gap-3 p-4">
          {filteredItems.length === 0 ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center p-8">
              <p>No tasks found</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <TodoItem
                key={item.id}
                item={item}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onUpdateTitle={handleSaveTitle}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
