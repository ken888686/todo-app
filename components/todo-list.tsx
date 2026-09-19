"use client";

import {
  addItem,
  deleteItem,
  updateItemStatus,
  updateItemTitle,
} from "@/lib/actions";
import {
  normalizeItemTitle,
  normalizeItemTitleForComparison,
} from "@/lib/item-validation";
import { Status } from "@/lib/generated/prisma/enums";
import type { ItemModel } from "@/lib/generated/prisma/models";
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
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

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
        item.title
          .toLocaleLowerCase()
          .includes(inputValue.trim().toLocaleLowerCase()),
      ),
    [optimisticItems, inputValue],
  );

  function setItemPending(id: number, pending: boolean) {
    setPendingIds((current) => {
      const next = new Set(current);
      if (pending) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  async function handleAdd(formData: FormData) {
    const titleResult = normalizeItemTitle(formData.get("title"));
    if (!titleResult.success) {
      toast.error(titleResult.error);
      return;
    }

    const normalizedTitle = normalizeItemTitleForComparison(titleResult.value);
    if (
      optimisticItems.some(
        (item) =>
          normalizeItemTitleForComparison(item.title) === normalizedTitle,
      )
    ) {
      toast.error("A todo with this title already exists");
      return;
    }

    startTransition(async () => {
      const tempId = Date.now();
      const newItem: ItemModel = {
        id: tempId,
        title: titleResult.value,
        status: Status.PENDING,
        dueAt: null,
        userId: "optimistic-user",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setOptimisticItems({ type: "ADD", item: newItem });
      setInputValue("");

      const result = await addItem(titleResult.value);

      if (!result.success) {
        toast.error(result.error);
        router.refresh();
      } else {
        toast.success("Todo added");
      }
    });
  }

  function handleStatusChange(id: number, checked: boolean) {
    setItemPending(id, true);
    startTransition(async () => {
      try {
        const newStatus: Status = checked ? Status.DONE : Status.PENDING;
        setOptimisticItems({ type: "UPDATE_STATUS", id, status: newStatus });

        const result = await updateItemStatus(id, newStatus);

        if (!result.success) {
          toast.error(result.error);
          router.refresh();
        } else {
          toast.success("Todo status updated");
        }
      } finally {
        setItemPending(id, false);
      }
    });
  }

  function handleSaveTitle(id: number, newTitle: string) {
    setItemPending(id, true);
    startTransition(async () => {
      try {
        setOptimisticItems({ type: "UPDATE_TITLE", id, title: newTitle });
        const result = await updateItemTitle(id, newTitle);

        if (!result.success) {
          toast.error(result.error);
          router.refresh();
        } else {
          toast.success("Todo updated");
        }
      } finally {
        setItemPending(id, false);
      }
    });
  }

  function handleDelete(id: number) {
    if (!window.confirm("Delete this todo?")) {
      return;
    }

    setItemPending(id, true);
    startTransition(async () => {
      try {
        setOptimisticItems({ type: "DELETE", id });
        const result = await deleteItem(id);
        if (!result.success) {
          toast.error(result.error);
          router.refresh();
        } else {
          toast.success("Todo deleted");
        }
      } finally {
        setItemPending(id, false);
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <form
        action={handleAdd}
        className="group border-border focus-within:border-foreground relative flex items-center gap-2 pb-2"
      >
        <label htmlFor="todo-title" className="sr-only">
          Search or add a todo
        </label>
        <Input
          id="todo-title"
          name="title"
          placeholder="Search or add a todo"
          className="h-11"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoComplete="off"
        />
        <Button
          type="submit"
          className="size-11"
          disabled={
            isPending ||
            inputValue.trim() === "" ||
            optimisticItems.some(
              (item) =>
                normalizeItemTitleForComparison(item.title) ===
                normalizeItemTitleForComparison(inputValue),
            )
          }
          aria-label="Add todo"
        >
          <CornerDownLeft size={16} />
          <span className="sr-only">Add todo</span>
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
                <p className="text-sm font-medium">
                  {inputValue.trim() ? "No matching todos" : "No todos yet"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {inputValue.trim()
                    ? "Press Enter to add this as a new todo."
                    : "Add your first todo above."}
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
                  isPending={pendingIds.has(item.id)}
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
