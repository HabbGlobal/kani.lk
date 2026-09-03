/**
 * Client-safe image URL helper. Deliberately its own module with no imports:
 * `lib/images.ts` pulls in sharp and Mongoose, and any client component that
 * touched it would drag the whole MongoDB driver into the browser bundle.
 *
 * The URL is immutable — the id never changes for a given image — which is what
 * lets the browser and any CDN cache each photo forever.
 */
export function imageUrl(id: string | { toString(): string } | null | undefined): string {
  return id ? `/api/images/${String(id)}` : "/placeholder-land.svg";
}
