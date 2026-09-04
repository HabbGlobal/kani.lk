import mongoose, { Schema, model, models, type Model, type InferSchemaType } from "mongoose";
import { ADMIN_ROLES } from "./types";

const AdminUserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    /** bcrypt hash, cost 12. Never selected by default. */
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ADMIN_ROLES, default: "editor" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    /** Single-use password reset token (hashed) + expiry. */
    resetTokenHash: { type: String, select: false },
    resetTokenExpiresAt: { type: Date, select: false },
  },
  { timestamps: true, collection: "kani_admin_users" }
);

export type AdminUserDoc = InferSchemaType<typeof AdminUserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AdminUser: Model<AdminUserDoc> =
  (models.KaniAdminUser as Model<AdminUserDoc>) ??
  model<AdminUserDoc>("KaniAdminUser", AdminUserSchema);

export default AdminUser;
