"use client";

import { useState } from "react";
import { GripHorizontal } from "lucide-react";

import { addCategory, deleteCategory, renameCategory, reorderCategories } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Button, Input, StatusDot } from "@/components/ui";
import Panel from "./Panel";

const TONES = ["brand", "sage", "neutral"];

export default function CategoriesPanel({ slug, categories, onCategories }) {
  // SettingsClient remounts this panel when the categories change, so local
  // order state starts fresh rather than being synced in from an effect.
  const [rows, setRows] = useState(categories);
  const [dragIndex, setDragIndex] = useState(null);
  const [adding, setAdding] = useState("");

  const move = (from, to) => {
    if (to < 0 || to >= rows.length || from === to) return;
    const next = [...rows];
    next.splice(to, 0, next.splice(from, 1)[0]);
    setRows(next);
  };

  const dirty = rows.map((r) => r.id).join() !== categories.map((c) => c.id).join();

  return (
    <Panel
      title="Categories"
      action={
        <Button
          disabled={!dirty}
          onClick={async () => {
            await reorderCategories(slug, rows.map((r) => r.id));
            await onCategories?.();
          }}
        >
          Save order
        </Button>
      }
    >
      <p className="text-body text-sand-800">
        Drag to reorder. The order here is the order of the filters above the feed.
      </p>

      <ul className="flex flex-col gap-2">
        {rows.map((category, index) => (
          <li
            key={category.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              move(dragIndex, index);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={cn(
              "bg-sand-100 rounded-inner px-5 py-4 flex flex-wrap items-center gap-3",
              dragIndex === index && "opacity-50",
            )}
          >
            {/* Dragging is a mouse gesture, so the handle also moves the row
                from the keyboard with the arrow keys. */}
            <button
              type="button"
              aria-label={`Reorder ${category.name}. Position ${index + 1} of ${rows.length}. Use arrow keys to move.`}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  move(index, index - 1);
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  move(index, index + 1);
                }
              }}
              className="cursor-grab text-sand-700 hover:text-ink"
            >
              <GripHorizontal className="lucide w-5 h-5" aria-hidden="true" />
            </button>

            <StatusDot tone={TONES[index % TONES.length]} label={category.name} />
            <p className="text-meta text-sand-700">{`${(category._count?.posts ?? category.postCount ?? 0).toLocaleString("en-GB")} posts`}</p>

            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const name = window.prompt("Rename category", category.name);
                  if (name?.trim()) {
                    await renameCategory(slug, category.id, name.trim());
                    await onCategories?.();
                  }
                }}
              >
                Rename
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await deleteCategory(slug, category.id);
                  await onCategories?.();
                }}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-start gap-2">
        <Input
          aria-label="New category name"
          placeholder="Add a category"
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <Button
          variant="secondary"
          disabled={!adding.trim()}
          onClick={async () => {
            await addCategory(slug, adding.trim());
            setAdding("");
            await onCategories?.();
          }}
        >
          Add category
        </Button>
      </div>
    </Panel>
  );
}
