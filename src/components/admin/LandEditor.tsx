"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, SectionHeading } from "@/components/ui/Card";
import { Field, Input, Textarea, Select, Checkbox, Segmented } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { LandCard } from "@/components/land/LandCard";
import { useI18n } from "@/lib/i18n/client";
import * as EnumLabel from "@/lib/i18n/enums";
import { localizedName } from "@/lib/i18n/localized";
import { ImageManager, type LandImage } from "@/components/admin/ImageManager";
import { landSchema, type LandFormValues } from "@/lib/validation";
import { adminFetch } from "@/lib/admin-fetch";
import {
  PURPOSES,
  SIZE_UNITS,
  DEED_TYPES,

  LAND_STATUSES,

  WATER_SOURCES,

} from "@/models/types";
import type { LandCard as LandCardType } from "@/lib/queries";

type Taxonomies = {
  districts: { _id: string; name: string; slug: string; code: string }[];
  cities: { _id: string; name: string; slug: string; district: string }[];
  landTypes: { _id: string; name: string; slug: string; hasBuilding: boolean }[];
};

export function LandEditor({
  mode,
  taxonomies,
  initial,
  landId,
  refCode,
  slug,
  images,
  coverImageId,
  title,
  subtitle,
}: {
  mode: "create" | "edit";
  taxonomies: Taxonomies;
  initial: LandFormValues;
  landId?: string;
  refCode?: string;
  slug?: string;
  images: LandImage[];
  coverImageId?: string;
  /** Rendered as the page heading, with the Save button beside it. */
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const { d, locale } = useI18n();
  const [serverError, setServerError] = useState("");
  const [images_, setImages] = useState(images);
  const [cover, setCover] = useState(coverImageId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LandFormValues>({ resolver: zodResolver(landSchema), defaultValues: initial });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control,
    name: "contactNumbers" as never,
  });
  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: "features" as never,
  });

  const values = watch();
  const selectedDistrict = watch("district");
  const selectedLandType = taxonomies.landTypes.find((t) => t._id === watch("landType"));
  const purpose = watch("purpose");

  const citiesForDistrict = useMemo(
    () => taxonomies.cities.filter((c) => c.district === selectedDistrict),
    [taxonomies.cities, selectedDistrict]
  );

  function onDistrictChange(id: string) {
    setValue("district", id, { shouldValidate: true });
    setValue("city", "", { shouldValidate: true });
  }

  async function onSubmit(data: LandFormValues) {
    setServerError("");
    try {
      const url = mode === "create" ? "/api/admin/lands" : `/api/admin/lands/${landId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error ?? d.admin.couldNotSaveListing);

      if (mode === "create") {
        router.push(`/admin/lands/${result.item._id}/edit?created=1`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not save the listing");
    }
  }

  // Live preview built from watch() — placeholder identity fields until the
  // listing actually exists (create) or from the real ones (edit).
  const previewDistrict = taxonomies.districts.find((d) => d._id === values.district);
  const previewCity = taxonomies.cities.find((c) => c._id === values.city);
  const previewLandType = taxonomies.landTypes.find((t) => t._id === values.landType);
  // `values` holds the schema's INPUT shape — fields with a Zod .default() or
  // a numeric preprocess are optional/unknown here until validated. This is a
  // read-only preview, so coerce defensively rather than importing the full
  // output-side typing just for display.
  // Clamped to >= 0 — the schema rejects negatives on submit, but the
  // preview shouldn't flash "-0.13 perches" while someone is still typing.
  const asNum = (v: unknown): number | undefined => {
    const n = typeof v === "number" ? v : v ? Number(v) : undefined;
    return n != null && Number.isFinite(n) && n >= 0 ? n : undefined;
  };

  const previewCard: LandCardType = {
    _id: landId ?? "preview",
    refCode: refCode ?? "KANI-DRAFT",
    title: values.title || "Untitled listing",
    slug: slug ?? "preview",
    purpose: values.purpose,
    salePrice: asNum(values.salePrice),
    rentAmount: asNum(values.rentAmount),
    rentPeriod: values.rentPeriod ?? "month",
    depositAmount: asNum(values.depositAmount),
    priceNegotiable: values.priceNegotiable ?? false,
    priceOnRequest: values.priceOnRequest ?? false,
    pricePerPerch: undefined,
    sizeValue: asNum(values.sizeValue) || 0,
    sizeUnit: values.sizeUnit,
    sizeInPerches: 0,
    area: values.area,
    nearestTown: values.nearestTown,
    distanceFromTownKm: asNum(values.distanceFromTownKm),
    deedType: values.deedType || undefined,
    accessRoadWidthFt: asNum(values.accessRoadWidthFt),
    coverImageId: cover,
    coverThumb: undefined,
    imageCount: images_.length,
    status: values.status ?? "available",
    district: { _id: previewDistrict?._id ?? "", name: previewDistrict?.name ?? "—", slug: previewDistrict?.slug ?? "" },
    city: { _id: previewCity?._id ?? "", name: previewCity?.name ?? "—", slug: previewCity?.slug ?? "" },
    landType: { _id: previewLandType?._id ?? "", name: previewLandType?.name ?? "—", slug: previewLandType?.slug ?? "" },
    soldAt: undefined,
    createdAt: new Date().toISOString(),
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[27px] text-[var(--heading)] md:text-[34px]">{title}</h1>
        {subtitle && (
          <p className="tabular mt-1 text-[16px] text-[var(--muted)]">{subtitle}</p>
        )}
        {serverError && (
          <p role="alert" className="mt-2 text-[14px] font-medium text-[var(--laterite)]">{serverError}</p>
        )}
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          {/* ── Publish ────────────────────────────────────────────────── */}
          <section>
            <SectionHeading title={d.admin.publish} />
            <Card className="grid gap-4 p-5 sm:grid-cols-3">
              <Checkbox label={d.admin.published} {...register("isPublished")} />
              <Checkbox label={d.admin.featured} {...register("isFeatured")} />
              <Checkbox label={d.admin.popular} {...register("isPopular")} />
            </Card>
          </section>

          {/* ── Basics ─────────────────────────────────────────────────── */}
        <section>
          <SectionHeading title={d.admin.basics} />
          <Card className="grid gap-4 p-5 sm:grid-cols-2">
            <Field
              label={d.admin.title}
              htmlFor="title"
              required
              className="sm:col-span-2"
              error={errors.title?.message}
            >
              <Input
                id="title"
                placeholder={d.admin.titlePlaceholder}
                {...register("title")}
              />
            </Field>
            <Field label={d.lands.purpose} className="sm:col-span-2">
              <Segmented
                name="purpose"
                value={purpose}
                onChange={(v) => setValue("purpose", v as LandFormValues["purpose"], { shouldValidate: true })}
                options={PURPOSES.map((p) => ({
                  value: p,
                  label: EnumLabel.PURPOSE[locale][p],
                }))}
              />
            </Field>
            <Field label={d.admin.status} htmlFor="status">
              <Select id="status" {...register("status")}>
                {LAND_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {EnumLabel.STATUS[locale][s]}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex items-end">
              <Checkbox label={d.admin.keepVisibleAfterSale} {...register("showWhenSold")} />
            </div>
          </Card>
        </section>

        {/* ── Location ───────────────────────────────────────────────── */}
        <section>
          <SectionHeading title={d.admin.location} />
          <Card className="grid gap-4 p-5 sm:grid-cols-2">
            <Field
              label={d.admin.districts}
              htmlFor="district"
              required
              error={errors.district?.message}
            >
              <Select id="district" value={selectedDistrict} onChange={(e) => onDistrictChange(e.target.value)}>
                <option value="">{d.admin.chooseDistrict}</option>
                {taxonomies.districts.map((district) => (
                  <option key={district._id} value={district._id}>
                    {localizedName(district, locale)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label={d.admin.cityTown}
              htmlFor="city"
              required
              error={errors.city?.message}
            >
              <Select id="city" {...register("city")} disabled={!selectedDistrict}>
                <option value="">{d.admin.chooseCity}</option>
                {citiesForDistrict.map((c) => (
                  <option key={c._id} value={c._id}>
                    {localizedName(c, locale)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label={d.admin.areaLocality}
              htmlFor="area"
              hint={d.admin.areaHint}
              error={errors.area?.message}
            >
              <Input id="area" {...register("area")} />
            </Field>
            <Field
              label={d.admin.addressLine}
              htmlFor="addressLine"
              error={errors.addressLine?.message}
            >
              <Input id="addressLine" {...register("addressLine")} />
            </Field>
            <Field
              label={d.admin.nearestTown}
              htmlFor="nearestTown"
              error={errors.nearestTown?.message}
            >
              <Input id="nearestTown" {...register("nearestTown")} />
            </Field>
            <Field
              label={d.admin.distanceFromTownKm}
              htmlFor="distanceFromTownKm"
              error={errors.distanceFromTownKm?.message}
            >
              <Input id="distanceFromTownKm" type="number" min={0} step="0.1" {...register("distanceFromTownKm")} />
            </Field>
            <Field label="Google Maps URL" htmlFor="googleMapsUrl" className="sm:col-span-2" error={errors.googleMapsUrl?.message}>
              <Input id="googleMapsUrl" {...register("googleMapsUrl")} />
            </Field>
          </Card>
        </section>

        {/* ── Land details ───────────────────────────────────────────── */}
        <section>
          <SectionHeading title={d.admin.landDetails} />
          <Card className="grid gap-4 p-5 sm:grid-cols-2">
            <Field
              label={d.lands.landType}
              htmlFor="landType"
              required
              error={errors.landType?.message}
            >
              <Select id="landType" {...register("landType")}>
                <option value="">{d.admin.chooseLandType}</option>
                {taxonomies.landTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {localizedName(type, locale)}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label={d.admin.size}
                htmlFor="sizeValue"
                required
                error={errors.sizeValue?.message}
              >
                <Input id="sizeValue" type="number" min={0.01} step="0.01" {...register("sizeValue")} />
              </Field>
              <Field label={d.admin.unit} htmlFor="sizeUnit">
                <Select id="sizeUnit" {...register("sizeUnit")}>
                  {SIZE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {EnumLabel.SIZE_UNIT[locale][u]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field
              label={d.lands.deedType}
              htmlFor="deedType"
              error={errors.deedType?.message}
            >
              <Select id="deedType" {...register("deedType")}>
                <option value="">{d.admin.notSpecified}</option>
                {DEED_TYPES.map((deed) => (
                  <option key={deed} value={deed}>
                    {EnumLabel.DEED_TYPE[locale][deed]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={d.land.waterSource} htmlFor="waterSource">
              <Select id="waterSource" {...register("waterSource")}>
                {WATER_SOURCES.map((w) => (
                  <option key={w} value={w}>
                    {EnumLabel.WATER_SOURCE[locale][w]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label={d.admin.accessRoadWidthFt}
              htmlFor="accessRoadWidthFt"
              error={errors.accessRoadWidthFt?.message}
            >
              <Input id="accessRoadWidthFt" type="number" min={0} {...register("accessRoadWidthFt")} />
            </Field>
            <Field
              label={d.admin.frontageFt}
              htmlFor="frontageFt"
              error={errors.frontageFt?.message}
            >
              <Input id="frontageFt" type="number" min={0} {...register("frontageFt")} />
            </Field>

            {selectedLandType?.hasBuilding && (
              <>
                <Field
                  label={d.admin.buildingSizeSqft}
                  htmlFor="buildingSizeSqft"
                  error={errors.buildingSizeSqft?.message}
                >
                  <Input id="buildingSizeSqft" type="number" min={0} {...register("buildingSizeSqft")} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label={d.land.bedrooms}
                    htmlFor="bedrooms"
                    error={errors.bedrooms?.message}
                  >
                    <Input id="bedrooms" type="number" min={0} {...register("bedrooms")} />
                  </Field>
                  <Field
                    label={d.land.bathrooms}
                    htmlFor="bathrooms"
                    error={errors.bathrooms?.message}
                  >
                    <Input id="bathrooms" type="number" min={0} {...register("bathrooms")} />
                  </Field>
                </div>
              </>
            )}

            <div className="sm:col-span-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Checkbox label={d.land.electricity} {...register("utilities.electricity")} />
              <Checkbox label={d.land.waterLine} {...register("utilities.waterLine")} />
              <Checkbox label={d.land.well} {...register("utilities.well")} />
              <Checkbox label={d.land.telecom} {...register("utilities.telecom")} />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <p className="text-[14px] font-medium text-[var(--ink)]">{d.admin.features}</p>
              {featureFields.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <Input {...register(`features.${i}` as const)} />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(i)}>{d.admin.remove}</Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendFeature("" as never)}>
                {d.admin.addFeature}
              </Button>
            </div>
          </Card>
        </section>

        {/* ── Pricing ────────────────────────────────────────────────── */}
        <section>
          <SectionHeading title={d.admin.pricing} />
          <Card className="grid gap-4 p-5 sm:grid-cols-2">
            {purpose !== "rent" && (
              <Field
                label={d.admin.salePriceLKR}
                htmlFor="salePrice"
                error={errors.salePrice?.message}
              >
                <Input id="salePrice" type="number" min={0} {...register("salePrice")} />
              </Field>
            )}
            {purpose !== "sale" && (
              <>
                <Field
                  label={d.admin.rentAmountLKR}
                  htmlFor="rentAmount"
                  error={errors.rentAmount?.message}
                >
                  <Input id="rentAmount" type="number" min={0} {...register("rentAmount")} />
                </Field>
                <Field label={d.admin.rentPeriod} htmlFor="rentPeriod">
                  <Select id="rentPeriod" {...register("rentPeriod")}>
                    <option value="month">{d.admin.perMonthOption}</option>
                    <option value="year">{d.admin.perYearOption}</option>
                  </Select>
                </Field>
                <Field
                  label={d.admin.depositAmountLKR}
                  htmlFor="depositAmount"
                  error={errors.depositAmount?.message}
                >
                  <Input id="depositAmount" type="number" min={0} {...register("depositAmount")} />
                </Field>
              </>
            )}
            <div className="flex items-end gap-4 sm:col-span-2">
              <Checkbox label={d.admin.negotiable} {...register("priceNegotiable")} />
              <Checkbox label={d.admin.priceOnRequest} {...register("priceOnRequest")} />
            </div>
          </Card>
        </section>

        {/* ── Photos ─────────────────────────────────────────────────── */}
        <section>
          <SectionHeading title={d.admin.photos} />
          <Card className="p-5">
            {mode === "create" ? (
              <p className="text-[15px] text-[var(--muted)]">
                {d.admin.saveDraftFirst}
              </p>
            ) : (
              <ImageManager
                landId={landId!}
                images={images_}
                coverImageId={cover}
                onChange={(imgs, coverId) => {
                  setImages(imgs);
                  setCover(coverId);
                }}
              />
            )}
          </Card>
        </section>

        {/* ── Contact ────────────────────────────────────────────────── */}
        <section>
          <SectionHeading title={d.admin.contact} />
          <Card className="grid gap-4 p-5 sm:grid-cols-2">
            <Field
              label={d.admin.ownerName}
              htmlFor="ownerName"
              required
              className="sm:col-span-2"
              error={errors.ownerName?.message}
            >
              <Input id="ownerName" {...register("ownerName")} />
            </Field>
            <div className="sm:col-span-2 space-y-2">
              <p className="text-[14px] font-medium text-[var(--ink)]">
                Contact numbers <span className="text-[var(--laterite)]">*</span>
              </p>
              {contactFields.map((f, i) => {
                const itemError = (errors.contactNumbers as unknown as { message?: string }[] | undefined)?.[i]
                  ?.message;
                return (
                  <div key={f.id}>
                    <div className="flex gap-2">
                      <Input placeholder="0771234567" {...register(`contactNumbers.${i}` as const)} />
                      {contactFields.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeContact(i)}>{d.admin.remove}</Button>
                      )}
                    </div>
                    {itemError && (
                      <p className="mt-1 text-[13px] font-medium text-[var(--laterite)]">{itemError}</p>
                    )}
                  </div>
                );
              })}
              {typeof errors.contactNumbers?.message === "string" && (
                <p className="text-[13px] font-medium text-[var(--laterite)]">{errors.contactNumbers.message}</p>
              )}
              <p className="text-[13px] text-[var(--muted)]">
                {d.admin.phoneFormatHint}
              </p>
              {contactFields.length < 4 && (
                <Button type="button" variant="outline" size="sm" onClick={() => appendContact("" as never)}>
                  {d.admin.addNumber}
                </Button>
              )}
            </div>
            <Field
              label={d.admin.whatsappNumber}
              htmlFor="whatsappNumber"
              hint={d.admin.whatsappFormatHint}
              error={errors.whatsappNumber?.message}
            >
              <Input id="whatsappNumber" placeholder="0771234567" {...register("whatsappNumber")} />
            </Field>
          </Card>
        </section>

        {/* ── Description ────────────────────────────────────────────── */}
        <section>
          <SectionHeading title={d.admin.description} />
          <Card className="grid gap-4 p-5">
            <Field
              label={d.admin.descriptionEnglish}
              htmlFor="description"
              required
              error={errors.description?.message}
            >
              <Textarea id="description" rows={8} {...register("description")} />
            </Field>
            <Field
              label={d.admin.descriptionTamil}
              htmlFor="descriptionTa"
              error={errors.descriptionTa?.message}
            >
              <Textarea id="descriptionTa" rows={6} {...register("descriptionTa")} />
            </Field>
          </Card>
        </section>

        </form>

        {/* ── Live preview ─────────────────────────────────────────────── */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <SectionHeading title={d.admin.preview} className="mb-3" />
          <div className="max-w-sm">
            <LandCard
              land={previewCard}
              href={mode === "edit" ? `/lands/${slug}?preview=1` : undefined}
              newTab={mode === "edit"}
              showFavourite={false}
            />
          </div>
          {mode === "edit" && (
            <p className="mt-2 text-[13px] text-[var(--muted)]">
              {d.admin.previewOpensNewTab}
            </p>
          )}
        </div>

        {/* Stays reachable while scrolled deep into a long form. */}
        <Button
          type="button"
          size="lg"
          disabled={isSubmitting}
          onClick={handleSubmit(onSubmit)}
          className="fixed bottom-6 right-6 z-40 shadow-[var(--shadow-lg)]"
        >
          {isSubmitting ? d.common.saving : mode === "create" ? d.admin.saveDraft : d.admin.saveChanges}
        </Button>
      </div>
    </div>
  );
}
