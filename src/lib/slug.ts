/** URL-safe slug. Keeps ASCII only, so Tamil titles fall back to the ref code. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/**
 * "10-perch-bare-land-omanthai-vavuniya-kani-vav-0042"
 * The ref code suffix guarantees uniqueness without a lookup loop.
 */
export function buildLandSlug(parts: {
  sizeLabel: string;
  landType: string;
  area?: string;
  district: string;
  refCode: string;
}): string {
  const words = [parts.sizeLabel, parts.landType, parts.area, parts.district, parts.refCode]
    .filter(Boolean)
    .join(" ");
  return slugify(words);
}

/**
 * Unique slug for a taxonomy row (district/city/land type). These are admin-
 * typed names that can collide ("Jaffna town" twice), so append -2, -3… on
 * conflict rather than failing the save.
 */
export async function uniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>
): Promise<string> {
  const root = slugify(base) || "item";
  let candidate = root;
  let n = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${n}`;
    n += 1;
  }
  return candidate;
}
