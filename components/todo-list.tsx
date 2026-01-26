"use client";

import {
  addItem,
  deleteItem,
  updateItemStatus,
  updateItemTitle,
} from "@/lib/actions";
import { Status } from "@/lib/generated/prisma/enums";
import { ItemModel } from "@/lib/generated/prisma/models";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useMemo, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { TodoItem } from "./todo-item";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";

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
  const router = useRouter();
  const items = use(initialItems);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();

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

    startTransition(async () => {
      const tempId = Date.now();
      const newItem: ItemModel = {
        id: tempId,
        title: inputValue,
        status: Status.PENDING,
        expiredAt: null,
        userId: "optimistic-user",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setOptimisticItems({ type: "ADD", item: newItem });
      setInputValue("");

      const result = await addItem(inputValue);

      if (!result.success) {
        toast.error(result.error);
        router.refresh();
      }
    });
  }

  function handleStatusChange(id: number, checked: boolean) {
    startTransition(async () => {
      const newStatus: Status = checked ? Status.DONE : Status.PENDING;
      setOptimisticItems({ type: "UPDATE_STATUS", id, status: newStatus });

      const result = await updateItemStatus(id, newStatus);

      if (!result.success) {
        toast.error(result.error);
        router.refresh();
      } else {
        toast("Item status updated");
      }
    });
  }

  function handleSaveTitle(id: number, newTitle: string) {
    startTransition(async () => {
      setOptimisticItems({ type: "UPDATE_TITLE", id, title: newTitle });
      const result = await updateItemTitle(id, newTitle);

      if (!result.success) {
        toast.error(result.error);
        router.refresh();
      }
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      setOptimisticItems({ type: "DELETE", id });
      const result = await deleteItem(id);
      if (!result.success) {
        toast.error(result.error);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <form
        action={handleAdd}
        className="group border-border focus-within:border-foreground relative flex items-center gap-2 pb-2"
      >
        <Input
          name="title"
          placeholder="Add a new todo"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoComplete="off"
        />
        <Button
          type="submit"
          disabled={
            isPending ||
            inputValue.trim() === "" ||
            filteredItems.some(
              (item) => item.title.toLowerCase() === inputValue.toLowerCase(),
            )
          }
          aria-pressed="false"
        >
          <CornerDownLeft size={16} />
        </Button>
      </form>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-1 p-1">
          <AnimatePresence initial={false} mode="popLayout">
            {filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-muted-foreground flex flex-col items-center justify-center"
              >
                <p className="text-xs tracking-widest uppercase">
                  [ System Idle ]
                </p>
              </motion.div>
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
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}

export function TodoListSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center gap-2 pb-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-10 w-1/12" />
      </div>
      <div className="min-h-0 flex-1">
        <div className="flex flex-col gap-1 p-1">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}
