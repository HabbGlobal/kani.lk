"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Card, EmptyState } from "@/components/ui/Card";
import { Field, Input, Select, Checkbox } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PagerBar } from "@/components/admin/PagerBar";
import { adminFetch } from "@/lib/admin-fetch";
import { districtSchema, citySchema, landTypeSchema } from "@/lib/validation";
import { useI18n } from "@/lib/i18n/client";

const PAGE_SIZE = 5;

type Kind = "district" | "city" | "land-type";

type Row = {
  _id: string;
  name: string;
  order: number;
  isActive: boolean;
  code?: string;
  province?: string;
  district?: string | { _id: string; name: string };
  hasBuilding?: boolean;
};

const SCHEMAS = { district: districtSchema, city: citySchema, "land-type": landTypeSchema } as const;
const API_BASE = { district: "/api/admin/districts", city: "/api/admin/cities", "land-type": "/api/admin/land-types" } as const;
const LABELS = { district: "district", city: "city or town", "land-type": "land type" } as const;

type FormValues = z.infer<(typeof SCHEMAS)[Kind]>;

/**
 * One manager component for all three taxonomy screens — districts, cities and
 * land types share the same list + inline form + delete-guard shape, and only
 * differ in which fields the form shows.
 */
export function TaxonomyManager({
  kind,
  initialRows,
  districts,
}: {
  kind: Kind;
  initialRows: Row[];
  /** Only used when kind === "city", to populate the district select. */
  districts?: { _id: string; name: string }[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [editing, setEditing] = useState<Row | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { d } = useI18n();
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = useMemo(
    () => rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [rows, safePage]
  );

  const schema = SCHEMAS[kind];
  const apiBase = API_BASE[kind];
  const label = LABELS[kind];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema as never) });

  function openCreate() {
    setEditing(null);
    reset({ name: "", order: rows.length, isActive: true } as FormValues);
    setShowForm(true);
    setError("");
  }

  function openEdit(row: Row) {
    setEditing(row);
    const districtId =
      typeof row.district === "object" ? row.district?._id : row.district;
    reset({
      name: row.name,
      order: row.order,
      isActive: row.isActive,
      code: row.code,
      province: row.province,
      district: districtId,
      hasBuilding: row.hasBuilding,
    } as FormValues);
    setShowForm(true);
    setError("");
  }

  async function onSubmit(values: FormValues) {
    setError("");
    const url = editing ? `${apiBase}/${editing._id}` : apiBase;
    const method = editing ? "PATCH" : "POST";
    try {
      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? d.admin.couldNotSave);

      setRows((prev) => {
        if (editing) return prev.map((r) => (r._id === editing._id ? { ...r, ...data.item } : r));
        return [...prev, data.item].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
      });
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.admin.couldNotSave);
    }
  }

  async function onDelete(row: Row) {
    if (!confirm(`Delete "${row.name}"? This cannot be undone.`)) return;
    setError("");
    try {
      const res = await adminFetch(`${apiBase}/${row._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? d.admin.couldNotDelete);
      setRows((prev) => prev.filter((r) => r._id !== row._id));
    } catch (err) {
      setError(err instanceof Error ? err.message : d.admin.couldNotDelete);
    }
  }

  const districtName = (row: Row) =>
    typeof row.district === "object"
      ? row.district?.name
      : districts?.find((d) => d._id === row.district)?.name;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] text-[var(--muted)]">{rows.length} total</p>
        <Button size="sm" onClick={openCreate}>
          Add {label}
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-[14px] font-medium text-[var(--laterite)]">
          {error}
        </p>
      )}

      {showForm && (
        <Card className="p-5">
          <h2 className="mb-4 text-[19px] text-[var(--heading)]">
            {editing ? `Edit ${label}` : `Add ${label}`}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
            <Field
              label={d.admin.name}
              htmlFor="name"
              required
              error={errors.name?.message as string | undefined}
            >
              <Input id="name" {...register("name")} />
            </Field>

            {kind === "district" && (
              <>
                <Field
                  label={d.admin.codeLabel}
                  htmlFor="code"
                  required
                  error={(errors as never as Record<string, { message?: string }>).code?.message}
                >
                  <Input id="code" placeholder="VAV" maxLength={4} {...register("code" as never)} />
                </Field>
                <Field label={d.admin.province} htmlFor="province">
                  <Input id="province" {...register("province" as never)} />
                </Field>
              </>
            )}

            {kind === "city" && (
              <Field
                label={d.admin.districts}
                htmlFor="district"
                required
                error={(errors as never as Record<string, { message?: string }>).district?.message}
              >
                <Select id="district" {...register("district" as never)}>
                  <option value="">{d.admin.chooseDistrict}</option>
                  {districts?.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </Select>
              </Field>
            )}

            {kind === "land-type" && (
              <div className="flex items-end">
                <Checkbox
                  label={d.admin.hasBuilding}
                  {...register("hasBuilding" as never)}
                />
              </div>
            )}

            <Field
              label={d.admin.sortOrder}
              htmlFor="order"
              hint={d.admin.sortOrderHint}
            >
              <Input id="order" type="number" {...register("order" as never, { valueAsNumber: true })} />
            </Field>

            <div className="flex items-end">
              <Checkbox label={d.admin.activeOnSite} {...register("isActive")} />
            </div>

            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? d.common.saving : d.common.save}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {rows.length === 0 ? (
        <EmptyState title={`No ${label}s yet`}>
          Add the first one to make it available across the site.
        </EmptyState>
      ) : (
        <Card className="divide-y divide-[var(--hairline)] overflow-hidden">
          {paged.map((row) => (
            <div key={row._id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-[var(--ink)]">
                  {row.name}
                  {!row.isActive && (
                    <span className="ml-2 rounded-[var(--radius-pill)] border border-[var(--hairline)] px-2 py-0.5 text-[11px] font-semibold uppercase text-[var(--muted)]">
                      Inactive
                    </span>
                  )}
                </p>
                <p className="truncate text-[13px] text-[var(--muted)]">
                  {[row.code, districtName(row)].filter(Boolean).join(" · ") || `Order ${row.order}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(row)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <PagerBar page={safePage} pageCount={pageCount} total={rows.length} itemLabel={`${label}s`} onChange={setPage} />
    </div>
  );
}
