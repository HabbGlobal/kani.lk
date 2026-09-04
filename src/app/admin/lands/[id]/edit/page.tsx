import type { Metadata } from "next";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Land from "@/models/Land";
import KaniImage, { IMAGE_META_PROJECTION } from "@/models/Image";
import { LandEditor } from "@/components/admin/LandEditor";
import { getAdminTaxonomies } from "@/lib/admin-queries";
import { plain } from "@/lib/utils";
import type { LandFormValues } from "@/lib/validation";

export const metadata: Metadata = { title: "Edit listing", robots: { index: false } };
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function EditLandPage({ params }: Params) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  await dbConnect();

  const [doc, taxonomies, images] = await Promise.all([
    Land.findById(id).lean(),
    getAdminTaxonomies(),
    KaniImage.find({ landId: id }).select(IMAGE_META_PROJECTION).sort({ order: 1 }).lean(),
  ]);

  if (!doc) notFound();

  const land = plain<Record<string, any>>(doc);

  // Mongo stores ObjectId refs; the form's selects work off string ids.
  const initial: LandFormValues = {
    title: land.title,
    purpose: land.purpose,
    salePrice: land.salePrice,
    rentAmount: land.rentAmount,
    rentPeriod: land.rentPeriod ?? "month",
    depositAmount: land.depositAmount,
    priceNegotiable: land.priceNegotiable ?? false,
    priceOnRequest: land.priceOnRequest ?? false,
    sizeValue: land.sizeValue,
    sizeUnit: land.sizeUnit,
    buildingSizeSqft: land.buildingSizeSqft,
    district: String(land.district),
    city: String(land.city),
    area: land.area,
    addressLine: land.addressLine,
    nearestTown: land.nearestTown,
    distanceFromTownKm: land.distanceFromTownKm,
    googleMapsUrl: land.googleMapsUrl,
    landType: String(land.landType),
    deedType: land.deedType,
    accessRoadWidthFt: land.accessRoadWidthFt,
    frontageFt: land.frontageFt,
    waterSource: land.waterSource ?? "none",
    utilities: land.utilities ?? { electricity: false, waterLine: false, well: false, telecom: false },
    bedrooms: land.bedrooms,
    bathrooms: land.bathrooms,
    features: land.features ?? [],
    description: land.description,
    descriptionTa: land.descriptionTa,
    ownerName: land.ownerName,
    contactNumbers: land.contactNumbers?.length ? land.contactNumbers : [""],
    whatsappNumber: land.whatsappNumber,
    status: land.status,
    showWhenSold: land.showWhenSold ?? true,
    isPublished: land.isPublished ?? false,
    isFeatured: land.isFeatured ?? false,
    isPopular: land.isPopular ?? false,
    popularRank: land.popularRank,
    imageIds: (land.imageIds ?? []).map(String),
    coverImageId: land.coverImageId ? String(land.coverImageId) : undefined,
  };

  return (
    <div className="max-w-6xl">
      <header className="mb-6">
        <h1 className="text-[27px] text-[var(--heading)] md:text-[34px]">
          {land.title}
        </h1>
        <p className="tabular mt-1 text-[16px] text-[var(--muted)]">
          {land.refCode} · {land.isPublished ? "Published" : "Draft"}
        </p>
      </header>

      <LandEditor
        mode="edit"
        taxonomies={taxonomies}
        initial={initial}
        landId={String(land._id)}
        refCode={land.refCode}
        slug={land.slug}
        images={plain(images)}
        coverImageId={land.coverImageId ? String(land.coverImageId) : undefined}
      />
    </div>
  );
}
