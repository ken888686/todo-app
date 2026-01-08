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
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";

export function TodoList({ initialItems }: { initialItems: ItemModel[] }) {
  const [items, setItems] = useState<ItemModel[]>(initialItems);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(inputValue.toLowerCase()),
  );

  async function handleAdd(formData: FormData) {
    const title = formData.get("title")?.toString();

    if (
      !title ||
      title.trim() === "" ||
      filteredItems.some((item) =>
        item.title.toLowerCase().includes(title.toLowerCase()),
      )
    ) {
      return;
    }

    await addItem({ title });
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

  async function handleSaveTitle(id: number) {
    if (
      tempTitle.trim() === "" ||
      tempTitle === items.find((i) => i.id === id)?.title
    ) {
      setEditingId(null);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, title: tempTitle } : item,
      ),
    );
    setEditingId(null);

    await updateItemTitle(id, tempTitle);
  }

  async function handleDelete(id: number) {
    await deleteItem(id);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <form action={handleAdd} className="flex items-center gap-2">
        <Input
          name="title"
          placeholder="Add a new todo"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
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
        >
          <Plus />
        </Button>
      </form>
      <ScrollArea className="min-h-0 flex-1 rounded-md border">
        <div className="flex flex-col gap-3 p-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="hover:bg-accent flex items-center justify-between gap-5 rounded-lg border p-3 hover:cursor-pointer"
              onClick={() => {
                if (editingId !== item.id) {
                  handleStatusChange(item.id, item.status !== Status.DONE);
                }
              }}
            >
              <div className="flex flex-1 items-center gap-3">
                <Checkbox
                  id={`todo-${item.id}`}
                  checked={item.status === Status.DONE}
                  onCheckedChange={(checked) =>
                    handleStatusChange(item.id, checked as boolean)
                  }
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="grid gap-1">
                  {editingId === item.id ? (
                    <Input
                      autoFocus
                      value={tempTitle}
                      className="h-7 px-2 py-0"
                      onChange={(e) => setTempTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={() => handleSaveTitle(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTitle(item.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                  ) : (
                    <label
                      className={`cursor-text text-sm leading-none font-medium ${
                        item.status === Status.DONE
                          ? "text-muted-foreground line-through"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(item.id);
                        setTempTitle(item.title);
                      }}
                    >
                      {item.title}
                    </label>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
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
