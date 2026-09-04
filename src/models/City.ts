import mongoose, { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const CitySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    nameTa: { type: String, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    district: { type: Schema.Types.ObjectId, ref: "KaniDistrict", required: true, index: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "kani_cities" }
);

// Slug only needs to be unique within its district.
CitySchema.index({ district: 1, slug: 1 }, { unique: true });

export type CityDoc = InferSchemaType<typeof CitySchema> & { _id: mongoose.Types.ObjectId };

export const City: Model<CityDoc> =
  (models.KaniCity as Model<CityDoc>) ?? model<CityDoc>("KaniCity", CitySchema);

export default City;
