"use client";

import { Status } from "@/lib/generated/prisma/enums";
import { ItemModel } from "@/lib/generated/prisma/models";
import { Trash2 } from "@deemlol/next-icons";
import { motion } from "framer-motion";
import { memo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group hover:border-border hover:bg-muted/30 flex items-center justify-between gap-3 border border-transparent p-2 transition-colors"
    >
      <div className="flex flex-1 items-center gap-3 overflow-hidden">
        <button
          onClick={() => onStatusChange(item.id, item.status !== Status.DONE)}
          className={`border-foreground hover:bg-foreground hover:text-background flex h-5 w-5 items-center justify-center border text-xs font-bold transition-all ${
            item.status === Status.DONE ? "bg-foreground text-background" : ""
          }`}
          aria-label={
            item.status === Status.DONE ? "Mark as undo" : "Mark as done"
          }
        >
          {item.status === Status.DONE && "X"}
        </button>

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
            <span
              className={`cursor-text truncate text-sm font-medium transition-all ${
                item.status === Status.DONE
                  ? "text-muted-foreground line-through decoration-2"
                  : "text-foreground"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setTempTitle(item.title);
              }}
            >
              {item.title}
            </span>
          )}

          {item.expiredAt && (
            <p className="text-muted-foreground text-xs">
              Expired At: {new Date(item.expiredAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Button
          variant="ghost"
          className="text-destructive flex p-1"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          aria-label="Delete todo"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
});
