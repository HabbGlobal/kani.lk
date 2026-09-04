"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, EmptyState } from "@/components/ui/Card";
import { Field, Input, Select, Checkbox } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { adminUserSchema, type AdminUserFormValues } from "@/lib/validation";

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
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save");

      setRows((prev) => {
        if (editing) return prev.map((r) => (r._id === editing._id ? { ...r, ...data.item } : r));
        return [...prev, data.item];
      });
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }

  async function toggleActive(row: UserRow) {
    if (row._id === selfId) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${row._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: row.name, email: row.email, role: row.role, isActive: !row.isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not update");
      setRows((prev) => prev.map((r) => (r._id === row._id ? { ...r, ...data.item } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] text-[var(--muted)]">{rows.length} admin user{rows.length === 1 ? "" : "s"}</p>
        <Button size="sm" onClick={openCreate}>Add admin user</Button>
      </div>

      {error && (
        <p role="alert" className="text-[14px] font-medium text-[var(--laterite)]">{error}</p>
      )}

      {showForm && (
        <Card className="p-5">
          <h2 className="mb-4 text-[19px] text-[var(--kani-green)]">
            {editing ? "Edit admin user" : "Add admin user"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="name" required error={errors.name?.message}>
              <Input id="name" {...register("name")} />
            </Field>
            <Field label="Email" htmlFor="email" required error={errors.email?.message}>
              <Input id="email" type="email" {...register("email")} />
            </Field>
            <Field label="Role" htmlFor="role">
              <Select id="role" {...register("role")}>
                <option value="editor">Editor</option>
                <option value="superadmin">Superadmin</option>
              </Select>
            </Field>
            <Field
              label={editing ? "New password" : "Password"}
              htmlFor="password"
              hint={editing ? "Leave blank to keep the current password" : "At least 8 characters"}
              error={errors.password?.message}
            >
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            </Field>
            <div className="flex items-end">
              <Checkbox label="Active" {...register("isActive")} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save"}</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {rows.length === 0 ? (
        <EmptyState title="No admin users yet" />
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
                  {row.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(row)}>Edit</Button>
                <Button
                  size="sm"
                  variant={row.isActive ? "danger" : "primary"}
                  disabled={row._id === selfId}
                  onClick={() => toggleActive(row)}
                >
                  {row.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
