import mongoose, { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * One document per photo — metadata only. The bytes live in S3-compatible
 * storage under `kani.lk/<_id>.webp` (see lib/s3.ts) and are delivered through
 * GET /api/images/[id].
 */
const ImageSchema = new Schema(
  {
    landId: { type: Schema.Types.ObjectId, ref: "KaniLand", index: true },
    /** Object key in the bucket, e.g. kani.lk/<id>.webp */
    key: { type: String, required: true },
    mimeType: { type: String, required: true, default: "image/webp" },
    bytes: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    /** Admin-editable, used verbatim in the alt attribute. */
    alt: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "kani_images" }
);

ImageSchema.index({ landId: 1, order: 1 });

export type ImageDoc = InferSchemaType<typeof ImageSchema> & { _id: mongoose.Types.ObjectId };

export const KaniImage: Model<ImageDoc> =
  (models.KaniImage as Model<ImageDoc>) ?? model<ImageDoc>("KaniImage", ImageSchema);

export default KaniImage;
