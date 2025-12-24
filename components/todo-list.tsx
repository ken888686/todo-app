"use client";
import { ItemModel } from "@/app/generated/prisma/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function TodoList({ initialItems }: { initialItems: ItemModel[] }) {
  const [items, setItems] = useState<ItemModel[]>(initialItems);
  const [inputValue, setInputValue] = useState("");

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add a new todo"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        />
        <Button size="icon-lg">
          <Plus />
        </Button>
      </div>

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-5 rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id={`todo-${item.id}`}
                checked={item.status === "DONE"}
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
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
