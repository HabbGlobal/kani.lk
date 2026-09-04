"use client";

import { Button } from "@/components/ui/Button";

/** Client-side Previous/Next pager for admin lists that filter in memory. */
export function PagerBar({
  page,
  pageCount,
  total,
  itemLabel,
  onChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  itemLabel: string;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <p className="text-[13px] text-[var(--muted)]">
        Page {page} of {pageCount} · {total} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onChange(Math.min(pageCount, page + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
