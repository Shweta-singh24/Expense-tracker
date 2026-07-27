import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    // ── Personal Information ───────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: { type: String, trim: true, default: null },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, enum: ["male", "female", "other", null], default: null },
    address: { type: String, trim: true, maxlength: [500, "Address cannot exceed 500 characters"], default: null },
    profileImage: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }, // Cloudinary public_id for deletion
    },

    // ── Professional Information (Read-Only via profile update) ────────────
    employeeId: { type: String, trim: true, default: null },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    designation: { type: String, trim: true, default: null },
    role: {
      type: String,
      enum: ["org_admin", "manager", "employee"],
      default: "org_admin",
    },

    // ── Organization ──────────────────────────────────────────────────────
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    // ── Account Status ────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    acceptedTerms: { type: Boolean, default: false },

    // ── Activity Tracking ─────────────────────────────────────────────────
    lastLogin: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    profileUpdatedAt: { type: Date, default: null },

    // ── Email Verification ────────────────────────────────────────────────
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpiry: { type: Date, default: null },

    // ── Password Reset ────────────────────────────────────────────────────
    passwordResetToken: { type: String, default: null },
    passwordResetExpiry: { type: Date, default: null },

    // ── Refresh Tokens (multi-device) ─────────────────────────────────────
    refreshTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Generate a secure random token and return { rawToken, hashedToken }
userSchema.statics.generateToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashedToken };
};

export default mongoose.model("User", userSchema);
