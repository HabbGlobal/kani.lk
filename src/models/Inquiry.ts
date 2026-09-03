import mongoose, { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const InquirySchema = new Schema(
  {
    /** Absent for contact-page messages. */
    land: { type: Schema.Types.ObjectId, ref: "KaniLand", index: true },
    landRefCode: { type: String },
    landTitle: { type: String },
    source: { type: String, enum: ["listing", "contact"], default: "listing", index: true },

    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    message: { type: String, required: true },

    isHandled: { type: Boolean, default: false, index: true },
    handledAt: { type: Date },
    handledBy: { type: Schema.Types.ObjectId, ref: "KaniAdminUser" },
    adminNote: { type: String, default: "" },

    /** Diagnostics for spam triage. */
    ipHash: { type: String },
    userAgent: { type: String },
    emailSent: { type: Boolean, default: false },
    emailError: { type: String },
  },
  { timestamps: true, collection: "kani_inquiries" }
);

InquirySchema.index({ isHandled: 1, createdAt: -1 });

export type InquiryDoc = InferSchemaType<typeof InquirySchema> & { _id: mongoose.Types.ObjectId };

export const Inquiry: Model<InquiryDoc> =
  (models.KaniInquiry as Model<InquiryDoc>) ?? model<InquiryDoc>("KaniInquiry", InquirySchema);

export default Inquiry;
