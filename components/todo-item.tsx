"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Status } from "@/lib/generated/prisma/enums";
import { ItemModel } from "@/lib/generated/prisma/models";
import { Trash2 } from "lucide-react";
import { memo, useRef, useState } from "react";

interface TodoItemProps {
  item: ItemModel;
  onStatusChange: (id: number, checked: boolean) => void;
  onDelete: (id: number) => void;
  onUpdateTitle: (id: number, newTitle: string) => void;
}

export const TodoItem = memo(function TodoItem({
  item,
  onStatusChange,
  onDelete,
  onUpdateTitle,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(item.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSaveTitle = () => {
    if (tempTitle.trim() === "" || tempTitle === item.title) {
      if (tempTitle.trim() === "") setTempTitle(item.title); // Revert if empty
      setIsEditing(false);
      return;
    }
    onUpdateTitle(item.id, tempTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setTempTitle(item.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      className="hover:bg-accent group flex items-center justify-between gap-5 rounded-lg border p-3 transition-colors hover:cursor-pointer"
      onClick={() => {
        if (!isEditing) {
          onStatusChange(item.id, item.status !== Status.DONE);
        }
      }}
    >
      <div className="flex flex-1 items-center gap-3 overflow-hidden">
        <Checkbox
          id={`todo-${item.id}`}
          checked={item.status === Status.DONE}
          onCheckedChange={(checked) =>
            onStatusChange(item.id, checked as boolean)
          }
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {isEditing ? (
            <Input
              ref={inputRef}
              autoFocus
              value={tempTitle}
              className="h-7 px-2 py-0"
              onChange={(e) => setTempTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <label
              className={`cursor-text truncate text-sm leading-none font-medium ${
                item.status === Status.DONE
                  ? "text-muted-foreground line-through"
                  : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setTempTitle(item.title);
              }}
            >
              {item.title}
            </label>
          )}

          {item.expiredAt && (
            <p className="text-muted-foreground text-xs">
              Expired At: {new Date(item.expiredAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          aria-label="Delete todo"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});
