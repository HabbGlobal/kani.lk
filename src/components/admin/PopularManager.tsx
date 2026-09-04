"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { imageUrl } from "@/lib/image-url";
import { Button } from "@/components/ui/Button";
import { adminFetch } from "@/lib/admin-fetch";
import { formatSize, formatLKR } from "@/lib/units";
import { cn } from "@/lib/utils";

export type PopularLand = {
  _id: string;
  title: string;
  refCode: string;
  coverImageId?: string;
  sizeValue: number;
  sizeUnit: "perch" | "acre" | "rood" | "sqft";
  salePrice?: number;
  district: string;
};

/**
 * Drag-to-order the popular row. Same reorder pattern as ImageManager (up/down
 * buttons as the primary control, since this is a mobile-first admin and touch
 * devices get no native drag-and-drop; HTML5 DnD layered on for desktop).
 *
 * This only reorders lands already marked isPopular — that flag itself is
 * toggled from the listings table's quick toggles, not here.
 */
export function PopularManager({ initial }: { initial: PopularLand[] }) {
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dragIndex = useRef<number | null>(null);

  function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setSaved(false);
  }

  function onDragStart(index: number) {
    dragIndex.current = index;
  }
  function onDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === index) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    setItems(next);
    setSaved(false);
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i._id !== id));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/lands/reorder-popular", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landIds: items.map((i) => i._id) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save the order");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the order");
    } finally {
      setSaving(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--hairline)] p-8 text-center">
        <p className="text-[16px] text-[var(--muted)]">
          Nothing is marked Popular yet. Toggle the Popular column on any
          listing in{" "}
          <Link href="/admin/lands" className="font-medium text-[var(--heading)] hover:underline">
            the listings table
          </Link>{" "}
          to add it here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save order"}
        </Button>
        {saved && <span className="text-[14px] font-medium text-[var(--paddy)]">Order saved.</span>}
        {error && <span className="text-[14px] font-medium text-[var(--laterite)]">{error}</span>}
      </div>

      <ul className="space-y-2">
        {items.map((land, i) => (
          <li
            key={land._id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
            className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--hairline)]
                       bg-[var(--card)] p-3 transition-[transform,box-shadow,border-color] duration-200
                       [transition-timing-function:var(--ease-out)] hover:-translate-y-0.5
                       hover:border-[var(--kani-green)]/30 hover:shadow-[var(--shadow-md)]
                       sm:gap-4 sm:p-4"
          >
            <span
              className="hidden shrink-0 cursor-grab text-[var(--muted)] sm:block"
              aria-hidden="true"
              title="Drag to reorder"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="currentColor">
                <circle cx="5" cy="4" r="1.3" /><circle cx="11" cy="4" r="1.3" />
                <circle cx="5" cy="8" r="1.3" /><circle cx="11" cy="8" r="1.3" />
                <circle cx="5" cy="12" r="1.3" /><circle cx="11" cy="12" r="1.3" />
              </svg>
            </span>

            <span className="tabular grid size-8 shrink-0 place-items-center rounded-full
                             bg-[var(--kani-green)]/10 text-[14px] font-semibold text-[var(--heading)]">
              {i + 1}
            </span>

            <div className="relative size-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--hairline)] sm:size-16">
              <Image src={imageUrl(land.coverImageId)} alt="" fill className="object-cover" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium text-[var(--ink)]">{land.title}</p>
              <p className="tabular text-[13px] text-[var(--muted)]">
                {formatSize(land.sizeValue, land.sizeUnit)}
                {land.salePrice ? ` · ${formatLKR(land.salePrice)}` : ""} · {land.refCode}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                <path d="M4 10l4-4 4 4" />
              </IconButton>
              <IconButton label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                <path d="M4 6l4 4 4-4" />
              </IconButton>
              <IconButton label="Remove from this order" onClick={() => remove(land._id)}>
                <path d="M4 4l8 8M12 4l-8 8" />
              </IconButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-9 cursor-pointer place-items-center rounded-full text-[var(--muted)]",
        "transition-[background-color,color,transform] duration-150 hover:scale-105",
        "hover:bg-[var(--kani-green)]/10 hover:text-[var(--heading)]",
        "disabled:pointer-events-none disabled:opacity-30 disabled:hover:scale-100"
      )}
    >
      <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor"
           strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}
