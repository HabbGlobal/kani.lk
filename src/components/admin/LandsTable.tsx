"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, EmptyState } from "@/components/ui/Card";
import { Field, Input, Select, Checkbox } from "@/components/ui/Field";
import { Button, ButtonLink } from "@/components/ui/Button";
import { imageUrl } from "@/lib/image-url";
import { adminFetch } from "@/lib/admin-fetch";
import { formatLKR, formatSize } from "@/lib/units";
import { LAND_STATUSES, PURPOSES } from "@/models/types";
import { useI18n } from "@/lib/i18n/client";
import type { Dictionary } from "@/lib/i18n";
import { localizedName } from "@/lib/i18n/localized";
import * as EnumLabel from "@/lib/i18n/enums";
import type { Locale } from "@/lib/i18n/config";
import { cn, formatDate } from "@/lib/utils";
import type { LandStatus, Purpose } from "@/models/types";

export type LandRow = {
  _id: string;
  refCode: string;
  title: string;
  purpose: Purpose;
  salePrice?: number;
  rentAmount?: number;
  sizeValue: number;
  sizeUnit: "perch" | "acre" | "rood" | "sqft";
  status: LandStatus;
  isPublished: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  coverImageId?: string;
  district: { _id: string; name: string };
  createdAt: string;
};

type ToggleField = "isPublished" | "isFeatured" | "isPopular";

const PAGE_SIZE = 5;

export function LandsTable({
  initialRows,
  districts,
}: {
  initialRows: LandRow[];
  districts: { _id: string; name: string }[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [district, setDistrict] = useState("");
  const [purpose, setPurpose] = useState("");
  const { d, t, locale } = useI18n();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const rx = q.trim() ? new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : null;
    return rows.filter((r) => {
      if (status && r.status !== status) return false;
      if (district && r.district?._id !== district) return false;
      if (purpose && r.purpose !== purpose) return false;
      if (rx && !rx.test(r.title) && !rx.test(r.refCode)) return false;
      return true;
    });
  }, [rows, q, status, district, purpose]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  function updateFilter(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  async function toggle(row: LandRow, field: ToggleField) {
    const prevValue = row[field];
    setRows((cur) => cur.map((r) => (r._id === row._id ? { ...r, [field]: !prevValue } : r)));
    setError("");
    try {
      const res = await adminFetch(`/api/admin/lands/${row._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !prevValue }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setRows((cur) => cur.map((r) => (r._id === row._id ? { ...r, [field]: prevValue } : r)));
      setError(d.admin.listingUpdateFailed);
    }
  }

  function toggleSelected(id: string) {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkPublish() {
    if (selected.size === 0) return;
    setBusy(true);
    setError("");
    const ids = Array.from(selected);
    try {
      await Promise.all(
        ids.map((id) =>
          adminFetch(`/api/admin/lands/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isPublished: true }),
          })
        )
      );
      setRows((cur) => cur.map((r) => (selected.has(r._id) ? { ...r, isPublished: true } : r)));
      setSelected(new Set());
    } catch {
      setError(d.admin.bulkPublishFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="grid gap-3 p-4 sm:grid-cols-4">
        <Field label={d.common.search} htmlFor="q">
          <Input
            id="q"
            placeholder={d.admin.searchPlaceholder}
            value={q}
            onChange={(e) => updateFilter(setQ, e.target.value)}
          />
        </Field>
        <Field label={d.admin.status} htmlFor="status">
          <Select id="status" value={status} onChange={(e) => updateFilter(setStatus, e.target.value)}>
            <option value="">{d.admin.allStatuses}</option>
            {LAND_STATUSES.map((v) => (
              <option key={v} value={v}>
                {EnumLabel.STATUS[locale][v]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={d.admin.districts} htmlFor="district">
          <Select id="district" value={district} onChange={(e) => updateFilter(setDistrict, e.target.value)}>
            <option value="">{d.admin.allDistricts}</option>
            {districts.map((district) => (
              <option key={district._id} value={district._id}>
                {localizedName(district, locale)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={d.lands.purpose} htmlFor="purpose">
          <Select id="purpose" value={purpose} onChange={(e) => updateFilter(setPurpose, e.target.value)}>
            <option value="">{d.admin.allPurposes}</option>
            {PURPOSES.map((v) => (
              <option key={v} value={v}>
                {EnumLabel.PURPOSE[locale][v]}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      {error && <p role="alert" className="text-[14px] font-medium text-[var(--laterite)]">{error}</p>}

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--kani-green)]/8 px-4 py-3">
          <p className="text-[14px] font-medium text-[var(--heading)]">
            {t(d.admin.selectedCount, { count: selected.size })}
          </p>
          <Button size="sm" onClick={bulkPublish} disabled={busy}>
            {busy ? d.admin.publishing : d.admin.publishSelected}
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={d.admin.noListingsMatch} />
      ) : (
        <>
          {/* Mobile: card stack */}
          <ul className="space-y-3 lg:hidden">
            {paged.map((row) => (
              <li key={row._id}>
                <RowCard
                  row={row}
                  selected={selected.has(row._id)}
                  onSelect={() => toggleSelected(row._id)}
                  onToggle={(f) => toggle(row, f)}
                  d={d}
                  locale={locale}
                />
              </li>
            ))}
          </ul>

          {/* Desktop: real table */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--card)] lg:block">
            <table className="w-full min-w-[900px] text-left text-[14px]">
              <thead className="border-b border-[var(--hairline)] text-[12px] uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="w-10 px-3 py-3"></th>
                  <th className="px-3 py-3">{d.admin.listing}</th>
                  <th className="px-3 py-3">{d.admin.districts}</th>
                  <th className="px-3 py-3">{d.admin.price}</th>
                  <th className="px-3 py-3">{d.admin.status}</th>
                  <th className="px-3 py-3">{d.admin.published}</th>
                  <th className="px-3 py-3">{d.admin.featured}</th>
                  <th className="px-3 py-3">{d.admin.popular}</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hairline)]">
                {paged.map((row) => (
                  <tr key={row._id} className="transition-colors hover:bg-[var(--hover-tint)]">
                    <td className="px-3 py-3">
                      <Checkbox
                        aria-label={`Select ${row.title}`}
                        label=""
                        checked={selected.has(row._id)}
                        onChange={() => toggleSelected(row._id)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Link href={`/admin/lands/${row._id}/edit`} className="flex items-center gap-3 hover:text-[var(--heading)]">
                        <span className="relative size-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--hairline)]">
                          <Image src={imageUrl(row.coverImageId)} alt="" fill sizes="48px" className="object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-[var(--ink)]">{row.title}</span>
                          <span className="tabular block text-[13px] text-[var(--muted)]">{row.refCode}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-[var(--muted)]">{row.district?.name}</td>
                    <td className="tabular px-3 py-3 text-[var(--muted)]">
                      {row.salePrice ? formatLKR(row.salePrice) : row.rentAmount ? `${formatLKR(row.rentAmount)}/mo` : "—"}
                      <span className="block text-[12px]">{formatSize(row.sizeValue, row.sizeUnit)}</span>
                    </td>
                    <td className="px-3 py-3">
                      <StatusChip status={row.status} locale={locale} />
                    </td>
                    <td className="px-3 py-3">
                      <ToggleDot on={row.isPublished} onClick={() => toggle(row, "isPublished")} />
                    </td>
                    <td className="px-3 py-3">
                      <ToggleDot on={row.isFeatured} onClick={() => toggle(row, "isFeatured")} />
                    </td>
                    <td className="px-3 py-3">
                      <ToggleDot on={row.isPopular} onClick={() => toggle(row, "isPopular")} />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <ButtonLink href={`/admin/lands/${row._id}/edit`} size="sm" variant="outline">
                        Edit
                      </ButtonLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-[13px] text-[var(--muted)]">
                Page {safePage} of {pageCount} · {filtered.length} listings
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={safePage >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusChip({
  status,
  locale,
}: {
  status: LandStatus;
  locale: Locale;
}) {
  const tone =
    status === "available"
      ? "bg-[var(--paddy)]/12 text-[var(--paddy)]"
      : status === "reserved"
      ? "bg-[var(--palmyra-gold)]/18 text-[var(--reserved-text)]"
      : "bg-[var(--laterite)]/12 text-[var(--laterite)]";
  return (
    <span className={cn("inline-flex items-center rounded-[var(--radius-pill)] px-2.5 py-1 text-[12px] font-medium", tone)}>
      {EnumLabel.STATUS[locale][status]}
    </span>
  );
}

function ToggleDot({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "grid size-8 cursor-pointer place-items-center rounded-full border transition-colors",
        on
          ? "border-[var(--kani-green)] bg-[var(--kani-green)] text-white"
          : "border-[var(--hairline)] text-transparent hover:border-[var(--kani-green)]/40"
      )}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
        <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function RowCard({
  row,
  selected,
  onSelect,
  onToggle,
  d,
  locale,
}: {
  row: LandRow;
  selected: boolean;
  onSelect: () => void;
  onToggle: (field: ToggleField) => void;
  d: Dictionary;
  locale: Locale;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="pt-1">
          <Checkbox label="" aria-label={`Select ${row.title}`} checked={selected} onChange={onSelect} />
        </div>
        <span className="relative size-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--hairline)]">
          <Image src={imageUrl(row.coverImageId)} alt="" fill sizes="56px" className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <Link href={`/admin/lands/${row._id}/edit`} className="block truncate text-[15px] font-medium text-[var(--ink)]">
            {row.title}
          </Link>
          <p className="tabular text-[13px] text-[var(--muted)]">{row.refCode} · {row.district?.name}</p>
          <p className="text-[13px] text-[var(--muted)]">
            {row.salePrice
              ? formatLKR(row.salePrice)
              : row.rentAmount
                ? `${formatLKR(row.rentAmount)}${d.admin.perMonthShort}`
                : d.land.priceOnRequest}
            {" · "}{formatSize(row.sizeValue, row.sizeUnit)}
          </p>
          <p className="mt-1">
            <StatusChip status={row.status} locale={locale} />
          </p>
          <p className="mt-1 text-[12px] text-[var(--muted)]">{formatDate(row.createdAt)}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[12px]">
        <ToggleButton
          label={d.admin.published}
          on={row.isPublished}
          onClick={() => onToggle("isPublished")}
        />
        <ToggleButton
          label={d.admin.featured}
          on={row.isFeatured}
          onClick={() => onToggle("isFeatured")}
        />
        <ToggleButton
          label={d.admin.popular}
          on={row.isPopular}
          onClick={() => onToggle("isPopular")}
        />
      </div>
    </Card>
  );
}

function ToggleButton({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "min-h-11 rounded-[var(--radius-md)] border px-2 py-2 font-medium transition-colors",
        on
          ? "border-[var(--kani-green)] bg-[var(--kani-green)]/10 text-[var(--heading)]"
          : "border-[var(--hairline)] text-[var(--muted)]"
      )}
    >
      {label}
    </button>
  );
}
