import mongoose, { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const LandTypeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    nameTa: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    /** Drives whether the editor shows bedrooms/bathrooms/building size. */
    hasBuilding: { type: Boolean, default: false },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "kani_land_types" }
);

LandTypeSchema.index({ isActive: 1, order: 1 });

export type LandTypeDoc = InferSchemaType<typeof LandTypeSchema> & { _id: mongoose.Types.ObjectId };

export const LandType: Model<LandTypeDoc> =
  (models.KaniLandType as Model<LandTypeDoc>) ?? model<LandTypeDoc>("KaniLandType", LandTypeSchema);

export default LandType;
