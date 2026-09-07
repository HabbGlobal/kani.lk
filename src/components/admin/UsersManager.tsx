"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, EmptyState } from "@/components/ui/Card";
import { Field, Input, Select, Checkbox } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { adminUserSchema, type AdminUserFormValues } from "@/lib/validation";
import { adminFetch } from "@/lib/admin-fetch";
import { useI18n } from "@/lib/i18n/client";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: "superadmin" | "editor";
  isActive: boolean;
};

export function UsersManager({
  initialRows,
  selfId,
}: {
  initialRows: UserRow[];
  selfId: string;
}) {
  const [rows, setRows] = useState(initialRows);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { d } = useI18n();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminUserFormValues>({ resolver: zodResolver(adminUserSchema) });

  function openCreate() {
    setEditing(null);
    reset({ name: "", email: "", role: "editor", isActive: true, password: "" });
    setShowForm(true);
    setError("");
  }

  function openEdit(row: UserRow) {
    setEditing(row);
    reset({ name: row.name, email: row.email, role: row.role, isActive: row.isActive, password: "" });
    setShowForm(true);
    setError("");
  }

  async function onSubmit(values: AdminUserFormValues) {
    setError("");
    const url = editing ? `/api/admin/users/${editing._id}` : "/api/admin/users";
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
        return [...prev, data.item];
      });
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : d.admin.couldNotSave);
    }
  }

  async function toggleActive(row: UserRow) {
    if (row._id === selfId) return;
    setError("");
    try {
      const res = await adminFetch(`/api/admin/users/${row._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: row.name, email: row.email, role: row.role, isActive: !row.isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? d.admin.couldNotUpdate);
      setRows((prev) => prev.map((r) => (r._id === row._id ? { ...r, ...data.item } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : d.admin.couldNotUpdate);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] text-[var(--muted)]">{rows.length} admin user{rows.length === 1 ? "" : "s"}</p>
        <Button size="sm" onClick={openCreate}>
          {d.admin.addAdminUser}
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-[14px] font-medium text-[var(--laterite)]">{error}</p>
      )}

      {showForm && (
        <Card className="p-5">
          <h2 className="mb-4 text-[19px] text-[var(--heading)]">
            {editing ? d.admin.editAdminUser : d.admin.addAdminUser}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
            <Field
              label={d.admin.name}
              htmlFor="name"
              required
              error={errors.name?.message}
            >
              <Input id="name" {...register("name")} />
            </Field>
            <Field
              label={d.admin.email}
              htmlFor="email"
              required
              error={errors.email?.message}
            >
              <Input id="email" type="email" {...register("email")} />
            </Field>
            <Field label={d.admin.role} htmlFor="role">
              <Select id="role" {...register("role")}>
                <option value="editor">{d.admin.editor}</option>
                <option value="superadmin">{d.admin.superadmin}</option>
              </Select>
            </Field>
            <Field
              label={editing ? d.admin.newPassword : d.admin.password}
              htmlFor="password"
              hint={editing ? d.admin.keepPasswordHint : d.admin.passwordHint}
              error={errors.password?.message}
            >
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            </Field>
            <div className="flex items-end">
              <Checkbox label={d.admin.active} {...register("isActive")} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? d.common.saving : d.common.save}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                {d.common.cancel}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {rows.length === 0 ? (
        <EmptyState title={d.admin.noAdminUsers} />
      ) : (
        <Card className="divide-y divide-[var(--hairline)] overflow-hidden">
          {rows.map((row) => (
            <div key={row._id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-[var(--ink)]">
                  {row.name}
                  {row._id === selfId && (
                    <span className="ml-2 text-[13px] font-normal text-[var(--muted)]">(you)</span>
                  )}
                </p>
                <p className="truncate text-[13px] text-[var(--muted)]">
                  {row.email} · <span className="capitalize">{row.role}</span> ·{" "}
                  {row.isActive ? d.admin.active : d.admin.inactive}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                  {d.common.edit}
                </Button>
                <Button
                  size="sm"
                  variant={row.isActive ? "danger" : "primary"}
                  disabled={row._id === selfId}
                  onClick={() => toggleActive(row)}
                >
                  {row.isActive ? d.admin.deactivate : d.admin.activate}
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
