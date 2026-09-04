"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, SectionHeading } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PageBody } from "@/components/site/PageBody";
import { pageSchema, type PageInput } from "@/lib/validation";

export function PageEditor({
  slug,
  initial,
}: {
  slug: string;
  initial: PageInput;
}) {
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PageInput>({ resolver: zodResolver(pageSchema), defaultValues: initial });

  const body = watch("body");

  async function onSubmit(values: PageInput) {
    setServerError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/pages/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save");
      setSaved(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Card className="space-y-4 p-5">
          <Field label="Title" htmlFor="title" required error={errors.title?.message}>
            <Input id="title" {...register("title")} />
          </Field>
          <Field
            label="Body"
            htmlFor="body"
            required
            hint={'"## " for a heading, "- " for a list item, blank lines between paragraphs'}
            error={errors.body?.message}
          >
            <Textarea id="body" rows={18} className="min-h-96 font-mono text-[14px]" {...register("body")} />
          </Field>
          <Field label="SEO title" htmlFor="seoTitle" error={errors.seoTitle?.message}>
            <Input id="seoTitle" {...register("seoTitle")} />
          </Field>
          <Field label="SEO description" htmlFor="seoDescription" error={errors.seoDescription?.message}>
            <Textarea id="seoDescription" {...register("seoDescription")} />
          </Field>

          {serverError && (
            <p role="alert" className="text-[14px] font-medium text-[var(--laterite)]">{serverError}</p>
          )}
          {saved && !serverError && (
            <p className="text-[14px] font-medium text-[var(--paddy)]">Page saved.</p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save page"}
          </Button>
        </Card>
      </form>

      <div>
        <SectionHeading title="Live preview" className="mb-3" />
        <Card className="p-6">
          <PageBody body={body || ""} />
        </Card>
      </div>
    </div>
  );
}
