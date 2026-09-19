"use client";

import { Status } from "@/lib/generated/prisma/enums";
import type { ItemViewModel } from "@/lib/item-query";
import { Trash2 } from "@deemlol/next-icons";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface TodoItemProps {
  item: ItemViewModel;
  onStatusChange: (id: number, checked: boolean) => void;
  onDelete: (id: number) => void;
  onUpdateTitle: (id: number, newTitle: string) => void;
  isPending: boolean;
}

export const TodoItem = memo(function TodoItem({
  item,
  onStatusChange,
  onDelete,
  onUpdateTitle,
  isPending,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(item.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const [now, setNow] = useState<number | null>(null);
  const [formattedDueAt, setFormattedDueAt] = useState("");

  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const timer = window.setInterval(updateNow, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!item.dueAt) {
      setFormattedDueAt("");
      return;
    }

    setFormattedDueAt(
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(item.dueAt)),
    );
  }, [item.dueAt]);

  const handleSaveTitle = () => {
    if (tempTitle.trim() === "" || tempTitle === item.title) {
      if (tempTitle.trim() === "") setTempTitle(item.title); // Revert if empty
      setIsEditing(false);
      return;
    }
    onUpdateTitle(item.id, tempTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
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
          type="button"
          onClick={() => onStatusChange(item.id, item.status !== Status.DONE)}
          disabled={isPending}
          className="hover:bg-muted focus-visible:ring-ring flex size-11 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-pressed={item.status === Status.DONE}
          aria-label={
            item.status === Status.DONE ? "Mark as incomplete" : "Mark as done"
          }
        >
          <span
            aria-hidden="true"
            className={`border-foreground flex size-5 items-center justify-center border text-xs font-bold transition-colors ${
              item.status === Status.DONE ? "bg-foreground text-background" : ""
            }`}
          >
            {item.status === Status.DONE && <Check className="size-3.5" />}
          </span>
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {isEditing ? (
            <Input
              ref={inputRef}
              autoFocus
              disabled={isPending}
              value={tempTitle}
              className="h-11 px-2 py-0"
              onChange={(e) => setTempTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <button
              type="button"
              disabled={isPending}
              className={`focus-visible:ring-ring min-w-0 truncate text-left text-sm font-medium transition-all focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
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
            </button>
          )}

          {item.dueAt && (
            <p className="text-muted-foreground text-xs">
              <time dateTime={new Date(item.dueAt).toISOString()}>
                Due: {formattedDueAt || "date pending"}
              </time>
              {now !== null &&
                item.status !== Status.DONE &&
                new Date(item.dueAt).getTime() < now && (
                  <span className="text-destructive ml-2 font-medium">
                    Overdue
                  </span>
                )}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive size-11 shrink-0"
          disabled={isPending}
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
