import mongoose, { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/** Singleton — always read/written with the fixed key "main". */
const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },

    // hero
    heroTitle: { type: String, default: "Find land you can trust in the North and East" },
    heroSubtitle: {
      type: String,
      default:
        "Verified blocks, paddy fields and homes across Vavuniya, Mannar, Jaffna, Batticaloa, Trincomalee and Mullaitivu — with the owner's number on every listing.",
    },
    // contact
    contactPhone: { type: String, default: "+94 77 000 0000" },
    contactPhoneAlt: { type: String, default: "" },
    contactEmail: { type: String, default: "info@kani.lk" },
    contactWhatsapp: { type: String, default: "" },
    officeAddress: { type: String, default: "Vavuniya, Sri Lanka" },
    officeHours: { type: String, default: "Monday to Saturday, 8.30am – 6.00pm" },

    // social
    facebookUrl: { type: String, default: "" },
    instagramUrl: { type: String, default: "" },
    tiktokUrl: { type: String, default: "" },
    youtubeUrl: { type: String, default: "" },

    // seo defaults
    seoTitle: { type: String, default: "kani.lk — Land for sale and rent in Northern & Eastern Sri Lanka" },
    seoDescription: {
      type: String,
      default:
        "Browse land, paddy fields, coconut estates and houses for sale or rent across the Northern and Eastern provinces. Contact owners directly on kani.lk.",
    },

    /** Popular row: manual ranking (default) or automatic by 30-day views. */
    popularMode: { type: String, enum: ["manual", "automatic"], default: "manual" },
    popularSectionTitle: { type: String, default: "Most popular lands" },

    /** Master switch for the "Recently sold and rented" homepage row. */
    showSoldRow: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "kani_site_settings" }
);

export type SiteSettingsDoc = InferSchemaType<typeof SiteSettingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SiteSettings: Model<SiteSettingsDoc> =
  (models.KaniSiteSettings as Model<SiteSettingsDoc>) ??
  model<SiteSettingsDoc>("KaniSiteSettings", SiteSettingsSchema);

export default SiteSettings;
