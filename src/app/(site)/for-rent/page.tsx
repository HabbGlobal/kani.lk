import type { Metadata } from "next";
import { PurposeLanding } from "@/components/site/PurposeLanding";
import type { RawParams } from "@/lib/search-params";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Land and property for rent in Northern and Eastern Sri Lanka",
  description:
    "Houses, shops, commercial buildings and land available to rent across Vavuniya, Mannar, Jaffna, Mullaitivu, Trincomalee and Batticaloa.",
  alternates: { canonical: "/for-rent" },
};

export default async function ForRentPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  return (
    <PurposeLanding
      purpose="rent"
      searchParams={await searchParams}
      title="Land and property for rent"
      intro="Houses, shops, commercial units and agricultural land available on a monthly rental. Rentals here are usually quoted as a monthly figure plus a refundable deposit, and both are shown on every listing so there are no surprises when you call."
    />
  );
}
