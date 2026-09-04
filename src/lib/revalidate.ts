import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Every place a listing's public visibility changes (publish toggle, feature/
 * popular toggle, status change, edit, delete) must call this so ISR-cached
 * pages don't serve stale content until their timer expires. Call it from the
 * admin API route right after the Mongo write succeeds.
 */
export function revalidateLandPages(slug?: string, districtSlug?: string) {
  revalidatePath("/");
  revalidatePath("/lands");
  revalidatePath("/for-sale");
  revalidatePath("/for-rent");
  revalidatePath("/districts");
  if (slug) revalidatePath(`/lands/${slug}`);
  if (districtSlug) revalidatePath(`/districts/${districtSlug}`);
}

/** For district/city/land-type/settings/page edits — broader, used less often. */
export function revalidateTaxonomyPages() {
  revalidatePath("/");
  revalidatePath("/lands");
  revalidatePath("/districts");
  revalidatePath("/for-sale");
  revalidatePath("/for-rent");
}

export function revalidateContentPage(slug: string) {
  revalidatePath(`/${slug}`);
}
