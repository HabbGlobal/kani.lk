"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { imageUrl, MAX_IMAGES_PER_LAND } from "@/lib/image-url";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { adminFetchOrThrow, SessionExpiredError } from "@/lib/admin-fetch";
import { useI18n } from "@/lib/i18n/client";

export type LandImage = { _id: string; alt?: string };

/**
 * Photo upload + reorder + cover selection for an existing (saved) listing.
 * Reorder is primarily up/down buttons — this is a mobile-first admin and
 * HTML5 drag-and-drop does not work on touch at all — with native HTML5 DnD
 * layered on top as a desktop-only enhancement.
 */
export function ImageManager({
  landId,
  images: initialImages,
  coverImageId: initialCover,
  onChange,
}: {
  landId: string;
  images: LandImage[];
  coverImageId?: string;
  onChange?: (images: LandImage[], coverImageId?: string) => void;
}) {
  const { d } = useI18n();
  const [images, setImages] = useState(initialImages);
  const [cover, setCover] = useState(initialCover);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const dragIndex = useRef<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function emit(nextImages: LandImage[], nextCover?: string) {
    setImages(nextImages);
    setCover(nextCover);
    onChange?.(nextImages, nextCover);
  }

  async function persistOrder(nextImages: LandImage[], nextCover?: string) {
    try {
      const res = await adminFetchOrThrow(`/api/admin/lands/${landId}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageIds: nextImages.map((i) => i._id),
          coverImageId: nextCover,
        }),
      });
      if (!res.ok) throw new Error();
      setError("");
    } catch (err) {
      setError(
        err instanceof SessionExpiredError
          ? err.message
          : d.admin.photoOrderFailed
      );
    }
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    emit(next, cover);
    void persistOrder(next, cover);
  }

  function setAsCover(id: string) {
    emit(images, id);
    void persistOrder(images, id);
  }

  async function removeImage(id: string) {
    if (!confirm(d.admin.confirmRemovePhoto)) return;
    setError("");
    try {
      const res = await adminFetchOrThrow(`/api/admin/lands/${landId}/images/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? d.admin.couldNotRemovePhoto);
      const next = images.filter((i) => i._id !== id);
      const nextCover = id === cover ? next[0]?._id : cover;
      emit(next, nextCover);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.admin.couldNotRemovePhoto);
    }
  }

  async function onFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (images.length + files.length > MAX_IMAGES_PER_LAND) {
      setError(`A listing can carry at most ${MAX_IMAGES_PER_LAND} photos.`);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));
      const res = await adminFetchOrThrow(`/api/admin/lands/${landId}/images`, { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? d.admin.uploadFailed);

      const newImages: LandImage[] = (data.imageIds as string[]).map((id) => ({ _id: id }));
      const next = [...images, ...newImages];
      const nextCover = cover ?? newImages[0]?._id;
      emit(next, nextCover);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.admin.uploadFailed);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  // Desktop-only progressive enhancement over the up/down buttons.
  function onDragStart(index: number) {
    dragIndex.current = index;
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }
  function onDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from == null || from === index) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    emit(next, cover);
    void persistOrder(next, cover);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileInput.current?.click()}
        >
          {uploading ? d.admin.uploading : d.admin.addPhotos}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => onFilesSelected(e.target.files)}
        />
        <p className="text-[13px] text-[var(--muted)]">
          {images.length} / {MAX_IMAGES_PER_LAND} photos
        </p>
      </div>

      {error && <p role="alert" className="text-[14px] font-medium text-[var(--laterite)]">{error}</p>}

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, i) => (
            <li
              key={img._id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(i)}
              className="group relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--card)]"
            >
              <div className="relative aspect-[4/3] bg-[var(--hairline)]">
                <Image src={imageUrl(img._id)} alt="" fill sizes="200px" className="object-cover" />
                {cover === img._id && (
                  <span className="absolute left-1.5 top-1.5 rounded-[var(--radius-pill)] bg-[var(--kani-green)] px-2 py-0.5 text-[11px] font-semibold text-white">
                    Cover
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex gap-1">
                  <IconButton
                    label={d.admin.moveEarlier}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    ←
                  </IconButton>
                  <IconButton
                    label={d.admin.moveLater}
                    disabled={i === images.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    →
                  </IconButton>
                </div>
                <div className="flex gap-1">
                  {cover !== img._id && (
                    <button
                      type="button"
                      onClick={() => setAsCover(img._id)}
                      className="cursor-pointer rounded-[var(--radius-sm)] px-1.5 py-1 text-[11px] font-medium text-[var(--heading)] hover:bg-[var(--kani-green)]/10"
                    >
                      Set cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img._id)}
                    className="cursor-pointer rounded-[var(--radius-sm)] px-1.5 py-1 text-[11px] font-medium text-[var(--laterite)] hover:bg-[var(--laterite)]/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IconButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-7 cursor-pointer place-items-center rounded-[var(--radius-sm)] text-[13px]",
        "text-[var(--muted)] hover:bg-[var(--hover-tint)] hover:text-[var(--ink)]",
        "disabled:pointer-events-none disabled:opacity-30"
      )}
    >
      {children}
    </button>
  );
}
