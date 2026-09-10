import mongoose, { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const DistrictSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    nameTa: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    /** Three-letter code used inside ref codes: VAV, MAN, JAF … */
    code: { type: String, required: true, uppercase: true, trim: true, maxlength: 4 },
    province: { type: String, trim: true, default: "" },
    /** Intro copy for the district landing page — this is what ranks. */
    intro: { type: String, default: "" },
    /** Tamil intro. Falls back to the English one when blank. */
    introTa: { type: String, default: "" },
    imageId: { type: Schema.Types.ObjectId, ref: "KaniImage" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "kani_districts" }
);

DistrictSchema.index({ isActive: 1, order: 1 });

export type DistrictDoc = InferSchemaType<typeof DistrictSchema> & { _id: mongoose.Types.ObjectId };

export const District: Model<DistrictDoc> =
  (models.KaniDistrict as Model<DistrictDoc>) ?? model<DistrictDoc>("KaniDistrict", DistrictSchema);

export default District;
