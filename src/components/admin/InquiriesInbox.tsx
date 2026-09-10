"use client";

import { useMemo, useState } from "react";
import { Card, EmptyState } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button, ButtonAnchor } from "@/components/ui/Button";
import { PagerBar } from "@/components/admin/PagerBar";
import { adminFetch } from "@/lib/admin-fetch";
import { timeAgo, formatDate, cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

const PAGE_SIZE = 5;

type InquiryRow = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  landTitle?: string;
  landRefCode?: string;
  land?: string;
  source: "listing" | "contact";
  isHandled: boolean;
  createdAt: string;
};

export function InquiriesInbox({
  initialRows,
  landOptions,
}: {
  initialRows: InquiryRow[];
  landOptions: { _id: string; title: string; refCode: string }[];
}) {
  const { d } = useI18n();
  const [rows, setRows] = useState(initialRows);
  const [landFilter, setLandFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showHandled, setShowHandled] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (landFilter && r.land !== landFilter) return false;
      if (!showHandled && r.isHandled) return false;
      if (from && new Date(r.createdAt) < new Date(from)) return false;
      if (to && new Date(r.createdAt) > new Date(`${to}T23:59:59.999Z`)) return false;
      return true;
    });
  }, [rows, landFilter, from, to, showHandled]);

  const newCount = rows.filter((r) => !r.isHandled).length;

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  function updateFilter<T>(setter: (v: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  async function markHandled(row: InquiryRow, handled: boolean) {
    const prev = rows;
    setRows((cur) => cur.map((r) => (r._id === row._id ? { ...r, isHandled: handled } : r)));
    try {
      const res = await adminFetch(`/api/admin/inquiries/${row._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHandled: handled }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setRows(prev);
      setError(d.admin.inquiryUpdateFailed);
    }
  }

  function exportHref() {
    const params = new URLSearchParams();
    if (landFilter) params.set("landId", landFilter);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return `/api/admin/inquiries/export${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {newCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--laterite)]/12 px-3 py-1 text-[13px] font-semibold text-[var(--laterite)]">
            {newCount} new
          </span>
        )}
        <div className="ml-auto">
          <ButtonAnchor href={exportHref()} variant="outline" size="sm">
            Export CSV
          </ButtonAnchor>
        </div>
      </div>

      <Card className="grid gap-3 p-4 sm:grid-cols-4">
        <Field label={d.admin.listing} htmlFor="landFilter">
          <Select id="landFilter" value={landFilter} onChange={(e) => updateFilter(setLandFilter, e.target.value)}>
            <option value="">{d.admin.allListings}</option>
            {landOptions.map((l) => (
              <option key={l._id} value={l._id}>{l.refCode} — {l.title}</option>
            ))}
          </Select>
        </Field>
        <Field label={d.admin.from} htmlFor="from">
          <Input id="from" type="date" value={from} onChange={(e) => updateFilter(setFrom, e.target.value)} />
        </Field>
        <Field label={d.admin.to} htmlFor="to">
          <Input id="to" type="date" value={to} onChange={(e) => updateFilter(setTo, e.target.value)} />
        </Field>
        <Field label={d.admin.status} htmlFor="showHandled">
          <Select
            id="showHandled"
            value={showHandled ? "all" : "new"}
            onChange={(e) => updateFilter(setShowHandled, e.target.value === "all")}
          >
            <option value="all">All</option>
            <option value="new">{d.admin.newOnly}</option>
          </Select>
        </Field>
      </Card>

      {error && <p role="alert" className="text-[14px] font-medium text-[var(--laterite)]">{error}</p>}

      {filtered.length === 0 ? (
        <EmptyState title={d.admin.noInquiriesMatch} />
      ) : (
        <ul className="space-y-3">
          {paged.map((r) => (
            <li key={r._id}>
              <Card className={cn("p-4", !r.isHandled && "border-[var(--laterite)]/40")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-medium text-[var(--ink)]">{r.name}</p>
                      {!r.isHandled && (
                        <span className="rounded-[var(--radius-pill)] bg-[var(--laterite)]/12 px-2 py-0.5 text-[11px] font-semibold uppercase text-[var(--laterite)]">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] text-[var(--muted)]">
                      {r.phone}{r.email ? ` · ${r.email}` : ""}
                    </p>
                    <p className="mt-1 text-[13px] text-[var(--muted)]">
                      {r.landTitle
                        ? `${r.landRefCode} — ${r.landTitle}`
                        : d.admin.generalEnquiry}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-[13px] text-[var(--muted)]">
                    <p title={formatDate(r.createdAt)}>{timeAgo(r.createdAt)}</p>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-[15px] text-[var(--ink)]">{r.message}</p>
                <div className="mt-3 flex gap-2">
                  {r.isHandled ? (
                    <Button size="sm" variant="outline" onClick={() => markHandled(r, false)}>
                      {d.admin.markAsNew}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => markHandled(r, true)}>
                      {d.admin.markHandled}
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <PagerBar page={safePage} pageCount={pageCount} total={filtered.length} itemLabel="enquiries" onChange={setPage} />
    </div>
  );
}
