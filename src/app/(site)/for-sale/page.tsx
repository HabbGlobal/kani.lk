import type { Metadata } from "next";
import { PurposeLanding } from "@/components/site/PurposeLanding";
import type { RawParams } from "@/lib/search-params";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Land for sale in Northern and Eastern Sri Lanka",
  description:
    "Every block of land, paddy field, coconut estate and house for sale across Vavuniya, Mannar, Jaffna, Mullaitivu, Trincomalee and Batticaloa.",
  alternates: { canonical: "/for-sale" },
};

export default async function ForSalePage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  return (
    <PurposeLanding
      purpose="sale"
      searchParams={await searchParams}
      title="Land for sale"
      intro="Blocks, acreage and property for outright purchase across the Northern and Eastern provinces. Prices are shown per listing and per perch, so you can compare like with like. Every listing carries the owner's own contact number — there is no commission and no middleman on a sale made through kani.lk."
    />
  );
}
