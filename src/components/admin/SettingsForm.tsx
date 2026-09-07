"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, SectionHeading } from "@/components/ui/Card";
import { Field, Input, Textarea, Segmented, Checkbox } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { settingsSchema, type SettingsFormValues } from "@/lib/validation";
import { adminFetch } from "@/lib/admin-fetch";
import { useI18n } from "@/lib/i18n/client";

export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const { d } = useI18n();
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
      if (!res.ok) throw new Error(data.error ?? d.admin.couldNotSaveSettings);
      setSaved(true);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : d.admin.couldNotSaveSettings
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-3xl space-y-8">
      <section>
        <SectionHeading title={d.admin.homepageHero} />
        <Card className="grid gap-4 p-5 sm:grid-cols-2">
          <Field
            label={d.admin.heroTitle}
            htmlFor="heroTitle"
            className="sm:col-span-2"
            error={errors.heroTitle?.message}
          >
            <Input id="heroTitle" {...register("heroTitle")} />
          </Field>
          <Field
            label={d.admin.heroSubtitle}
            htmlFor="heroSubtitle"
            className="sm:col-span-2"
            error={errors.heroSubtitle?.message}
          >
            <Textarea id="heroSubtitle" {...register("heroSubtitle")} />
          </Field>
        </Card>
      </section>

      <section>
        <SectionHeading title={d.admin.contactDetails} />
        <Card className="grid gap-4 p-5 sm:grid-cols-2">
          <Field
            label={d.admin.phone}
            htmlFor="contactPhone"
            required
            error={errors.contactPhone?.message}
          >
            <Input id="contactPhone" {...register("contactPhone")} />
          </Field>
          <Field
            label={d.admin.alternatePhone}
            htmlFor="contactPhoneAlt"
            error={errors.contactPhoneAlt?.message}
          >
            <Input id="contactPhoneAlt" {...register("contactPhoneAlt")} />
          </Field>
          <Field
            label={d.admin.email}
            htmlFor="contactEmail"
            error={errors.contactEmail?.message}
          >
            <Input id="contactEmail" type="email" {...register("contactEmail")} />
          </Field>
          <Field
            label={d.admin.whatsappNumber}
            htmlFor="contactWhatsapp"
            hint={d.admin.whatsappHint}
            error={errors.contactWhatsapp?.message}
          >
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
        <SectionHeading title={d.admin.socialLinks} />
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
        <SectionHeading title={d.admin.seoDefaults} />
        <Card className="grid gap-4 p-5 sm:grid-cols-2">
          <Field
            label={d.admin.defaultSeoTitle}
            htmlFor="seoTitle"
            className="sm:col-span-2"
            error={errors.seoTitle?.message}
          >
            <Input id="seoTitle" {...register("seoTitle")} />
          </Field>
          <Field
            label={d.admin.defaultSeoDescription}
            htmlFor="seoDescription"
            className="sm:col-span-2"
            error={errors.seoDescription?.message}
          >
            <Textarea id="seoDescription" {...register("seoDescription")} />
          </Field>
        </Card>
      </section>

      <section>
        <SectionHeading
          title={d.admin.popularRow}
          subtitle={d.admin.popularRowSub}
        />
        <Card className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label={d.admin.mode} className="sm:col-span-2">
            <Segmented
              name="popularMode"
              value={popularMode}
              onChange={(v) => setValue("popularMode", v as "manual" | "automatic", { shouldDirty: true })}
              options={[
                { value: "manual", label: d.admin.manualRanking },
                { value: "automatic", label: d.admin.automaticViews },
              ]}
            />
          </Field>
          <Field label="Section title" htmlFor="popularSectionTitle" className="sm:col-span-2" error={errors.popularSectionTitle?.message}>
            <Input id="popularSectionTitle" {...register("popularSectionTitle")} />
          </Field>
          <div className="sm:col-span-2">
            <Checkbox
              label={d.admin.showSoldRow}
              {...register("showSoldRow")}
            />
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
        {isSubmitting ? d.common.saving : d.admin.saveSettings}
      </Button>
    </form>
  );
}
