"use client";
import { Status } from "@/app/generated/prisma/enums";
import { ItemCreateInput, ItemModel } from "@/app/generated/prisma/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addItem, deleteItem, updateItemStatus } from "@/lib/actions";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";

export function TodoList({ initialItems }: { initialItems: ItemModel[] }) {
  const [items, setItems] = useState<ItemModel[]>(initialItems);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(inputValue.toLowerCase()),
  );

  async function handleAdd(newItem: ItemCreateInput) {
    if (
      !newItem.title ||
      newItem.title.trim() === "" ||
      filteredItems.some((item) =>
        item.title.toLowerCase().includes(newItem.title.toLowerCase()),
      )
    ) {
      return;
    }

    await addItem(newItem);
    setInputValue("");
  }

  async function handleStatusChange(id: number, checked: boolean) {
    const newStatus: Status = checked ? Status.DONE : Status.PENDING;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item,
      ),
    );

    await updateItemStatus({ id, status: newStatus });
  }

  async function handleDelete(id: number) {
    await deleteItem(id);
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add a new todo"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        />
        <Button
          size="icon-lg"
          onClick={() => handleAdd({ title: inputValue })}
          disabled={
            inputValue.trim() === "" ||
            filteredItems.some((item) =>
              item.title.toLowerCase().includes(inputValue.toLowerCase()),
            )
          }
        >
          <Plus />
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1 rounded-md border">
        <div className="flex flex-col gap-3 p-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-5 rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`todo-${item.id}`}
                  checked={item.status === Status.DONE}
                  onCheckedChange={(checked) =>
                    handleStatusChange(item.id, checked as boolean)
                  }
                />
                <div className="grid gap-0.5">
                  <label
                    htmlFor={`todo-${item.id}`}
                    className="text-sm leading-none font-medium"
                  >
                    {item.title}
                  </label>
                  {item.expiredAt && (
                    <p className="text-muted-foreground text-xs">
                      過期時間: {new Date(item.expiredAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Badge variant="outline">{item.status}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
