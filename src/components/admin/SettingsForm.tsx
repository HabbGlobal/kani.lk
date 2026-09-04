"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, SectionHeading } from "@/components/ui/Card";
import { Field, Input, Textarea, Segmented, Checkbox } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { settingsSchema, type SettingsFormValues } from "@/lib/validation";
import { adminFetch } from "@/lib/admin-fetch";

export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({ resolver: zodResolver(settingsSchema), defaultValues: initial });

  const popularMode = watch("popularMode");

  async function onSubmit(values: SettingsFormValues) {
    setServerError("");
    setSaved(false);
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save settings");
      setSaved(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not save settings");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-3xl space-y-8">
      <section>
        <SectionHeading title="Homepage hero" />
        <Card className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Hero title" htmlFor="heroTitle" className="sm:col-span-2" error={errors.heroTitle?.message}>
            <Input id="heroTitle" {...register("heroTitle")} />
          </Field>
          <Field label="Hero subtitle" htmlFor="heroSubtitle" className="sm:col-span-2" error={errors.heroSubtitle?.message}>
            <Textarea id="heroSubtitle" {...register("heroSubtitle")} />
          </Field>
        </Card>
      </section>

      <section>
        <SectionHeading title="Contact details" />
        <Card className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Phone" htmlFor="contactPhone" required error={errors.contactPhone?.message}>
            <Input id="contactPhone" {...register("contactPhone")} />
          </Field>
          <Field label="Alternate phone" htmlFor="contactPhoneAlt" error={errors.contactPhoneAlt?.message}>
            <Input id="contactPhoneAlt" {...register("contactPhoneAlt")} />
          </Field>
          <Field label="Email" htmlFor="contactEmail" error={errors.contactEmail?.message}>
            <Input id="contactEmail" type="email" {...register("contactEmail")} />
          </Field>
          <Field label="WhatsApp number" htmlFor="contactWhatsapp" hint="Used for the wa.me link" error={errors.contactWhatsapp?.message}>
            <Input id="contactWhatsapp" {...register("contactWhatsapp")} />
          </Field>
          <Field label="Office address" htmlFor="officeAddress" className="sm:col-span-2" error={errors.officeAddress?.message}>
            <Input id="officeAddress" {...register("officeAddress")} />
          </Field>
          <Field label="Office hours" htmlFor="officeHours" className="sm:col-span-2" error={errors.officeHours?.message}>
            <Input id="officeHours" {...register("officeHours")} />
          </Field>
        </Card>
      </section>

      <section>
        <SectionHeading title="Social links" />
        <Card className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Facebook" htmlFor="facebookUrl" error={errors.facebookUrl?.message}>
            <Input id="facebookUrl" {...register("facebookUrl")} />
          </Field>
          <Field label="Instagram" htmlFor="instagramUrl" error={errors.instagramUrl?.message}>
            <Input id="instagramUrl" {...register("instagramUrl")} />
          </Field>
          <Field label="TikTok" htmlFor="tiktokUrl" error={errors.tiktokUrl?.message}>
            <Input id="tiktokUrl" {...register("tiktokUrl")} />
          </Field>
          <Field label="YouTube" htmlFor="youtubeUrl" error={errors.youtubeUrl?.message}>
            <Input id="youtubeUrl" {...register("youtubeUrl")} />
          </Field>
        </Card>
      </section>

      <section>
        <SectionHeading title="SEO defaults" />
        <Card className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Default SEO title" htmlFor="seoTitle" className="sm:col-span-2" error={errors.seoTitle?.message}>
            <Input id="seoTitle" {...register("seoTitle")} />
          </Field>
          <Field label="Default SEO description" htmlFor="seoDescription" className="sm:col-span-2" error={errors.seoDescription?.message}>
            <Textarea id="seoDescription" {...register("seoDescription")} />
          </Field>
        </Card>
      </section>

      <section>
        <SectionHeading title="Popular row" subtitle="Also switchable from the Popular row screen — this is the source of truth." />
        <Card className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Mode" className="sm:col-span-2">
            <Segmented
              name="popularMode"
              value={popularMode}
              onChange={(v) => setValue("popularMode", v as "manual" | "automatic", { shouldDirty: true })}
              options={[
                { value: "manual", label: "Manual ranking" },
                { value: "automatic", label: "Automatic (30-day views)" },
              ]}
            />
          </Field>
          <Field label="Section title" htmlFor="popularSectionTitle" className="sm:col-span-2" error={errors.popularSectionTitle?.message}>
            <Input id="popularSectionTitle" {...register("popularSectionTitle")} />
          </Field>
          <div className="sm:col-span-2">
            <Checkbox label="Show the 'Recently sold and rented' row on the homepage" {...register("showSoldRow")} />
          </div>
        </Card>
      </section>

      {serverError && (
        <p role="alert" className="text-[14px] font-medium text-[var(--laterite)]">{serverError}</p>
      )}
      {saved && !serverError && (
        <p className="text-[14px] font-medium text-[var(--paddy)]">Settings saved.</p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
