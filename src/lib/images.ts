import sharp from "sharp";
import type { Types } from "mongoose";
import KaniImage from "@/models/Image";

/**
 * Image pipeline. Photos are stored base64 in Mongo (one document each) and
 * always delivered as binary through GET /api/images/[id]. Base64 must never
 * appear in a page payload or JSON response — the sole exception is the sub-1KB
 * LQIP thumb, which is what stops the grid flashing grey.
 */

export const MAX_IMAGES_PER_LAND = 15;
export const MAX_ENCODED_BYTES = 400 * 1024; // 400KB after WebP encoding
export const MAX_LONG_EDGE = 1600;
export const WEBP_QUALITY = 72;

export type ProcessedImage = {
  data: string; // base64, no data-URI prefix
  mimeType: "image/webp";
  bytes: number;
  width: number;
  height: number;
};

export class ImageTooLargeError extends Error {
  constructor(public filename: string, public bytes: number) {
    super(
      `"${filename}" is still ${Math.round(bytes / 1024)}KB after compression ` +
        `(limit ${MAX_ENCODED_BYTES / 1024}KB). Please upload a smaller or less detailed photo.`
    );
    this.name = "ImageTooLargeError";
  }
}

/** Watermark: the kani.lk wordmark, rendered as SVG so there is no asset dependency. */
function watermarkSvg(width: number): Buffer {
  const w = Math.max(120, Math.round(width * 0.26));
  const h = Math.round(w * 0.3);
  const fs = Math.round(h * 0.46);
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${w}" height="${h}" rx="${Math.round(h / 2)}"
            fill="rgba(10,44,30,0.46)"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
            font-family="Georgia, serif" font-size="${fs}" fill="#F6F5F1"
            letter-spacing="0.5">kani<tspan fill="#BE9B4E">.lk</tspan></text>
    </svg>`
  );
}

/**
 * Strip EXIF (phone photos carry GPS, a privacy problem for the owner),
 * resize, convert to WebP, and optionally watermark the cover.
 */
export async function processImage(
  input: Buffer,
  opts: { watermark?: boolean; filename?: string } = {}
): Promise<ProcessedImage> {
  const filename = opts.filename ?? "image";

  // rotate() applies EXIF orientation, then we drop all metadata on output.
  const base = sharp(input, { failOn: "none" }).rotate();
  const meta = await base.metadata();

  let pipeline = base.resize({
    width: MAX_LONG_EDGE,
    height: MAX_LONG_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (opts.watermark) {
    const targetW = Math.min(meta.width ?? MAX_LONG_EDGE, MAX_LONG_EDGE);
    pipeline = pipeline.composite([
      { input: watermarkSvg(targetW), gravity: "southeast" },
    ]);
  }

  let out = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();

  // One salvage pass at lower quality before rejecting outright.
  if (out.length > MAX_ENCODED_BYTES) {
    out = await sharp(out).webp({ quality: 58 }).toBuffer();
  }
  if (out.length > MAX_ENCODED_BYTES) {
    throw new ImageTooLargeError(filename, out.length);
  }

  const outMeta = await sharp(out).metadata();

  return {
    data: out.toString("base64"),
    mimeType: "image/webp",
    bytes: out.length,
    width: outMeta.width ?? 0,
    height: outMeta.height ?? 0,
  };
}

/**
 * ~20px LQIP as a data URI, under 1KB. This is the one place base64 is allowed
 * to travel inline, because it is what feeds next/image placeholder="blur".
 */
export async function makeLqip(input: Buffer): Promise<string> {
  const buf = await sharp(input, { failOn: "none" })
    .rotate()
    .resize(20, 15, { fit: "inside" })
    .webp({ quality: 32 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

/** Store a processed photo as its own document and return the id. */
export async function storeImage(
  processed: ProcessedImage,
  meta: { landId?: Types.ObjectId; alt?: string; order?: number }
) {
  const doc = await KaniImage.create({
    landId: meta.landId,
    data: processed.data,
    mimeType: processed.mimeType,
    bytes: processed.bytes,
    width: processed.width,
    height: processed.height,
    alt: meta.alt ?? "",
    order: meta.order ?? 0,
  });
  return doc._id;
}

