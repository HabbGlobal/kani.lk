import mongoose, { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * One document per photo. The base64 payload lives ONLY here — never embedded
 * in a land document, and never sent inside a page payload or JSON response.
 * It is decoded back to binary by GET /api/images/[id].
 */
const ImageSchema = new Schema(
  {
    landId: { type: Schema.Types.ObjectId, ref: "KaniLand", index: true },
    /** base64, no data-URI prefix. */
    data: { type: String, required: true },
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

/** Projection that excludes the payload. Use for every gallery/metadata query. */
export const IMAGE_META_PROJECTION = { data: 0 } as const;
