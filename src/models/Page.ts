import mongoose, { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/** about / terms / privacy body content, editable from admin. */
const PageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    /** Markdown-ish body; rendered as paragraphs and headings. */
    body: { type: String, default: "" },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "KaniAdminUser" },
  },
  { timestamps: true, collection: "kani_pages" }
);

export type PageDoc = InferSchemaType<typeof PageSchema> & { _id: mongoose.Types.ObjectId };

export const Page: Model<PageDoc> =
  (models.KaniPage as Model<PageDoc>) ?? model<PageDoc>("KaniPage", PageSchema);

export default Page;
