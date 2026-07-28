import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Organization email is required"],
      unique: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Organization phone is required"],
      trim: true,
    },
    logo: {
      type: String, // Cloudinary URL (optional)
      default: null,
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Ownership & Tenant Status ───────────────────────────────────────────
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // the org_admin who registered the org
    status: { type: String, enum: ["active", "suspended", "trial"], default: "trial" },

    // ── Subscription (Section 21/22 of the spec) ────────────────────────────
    subscriptionPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", default: null },
    storageUsedMB: { type: Number, default: 0, min: 0 },
    aiCreditsUsed: { type: Number, default: 0, min: 0 },

    // ── Org-wide configurable settings ──────────────────────────────────────
    settings: {
      currency: { type: String, default: "USD" }, // ISO 4217
      fiscalYearStart: { type: String, default: "01-01" }, // MM-DD
      // Config-driven multi-level approval chain — read by approvalService.
      // Example: [{ level: 1, approverRole: "manager", autoApproveUnderAmount: 0 },
      //           { level: 2, approverRole: "org_admin", autoApproveUnderAmount: 500 }]
      approvalLevels: {
        type: [
          {
            level: { type: Number, required: true },
            approverRole: { type: String, enum: ["manager", "org_admin"], required: true },
            autoApproveUnderAmount: { type: Number, default: 0 },
          },
        ],
        default: [{ level: 1, approverRole: "manager", autoApproveUnderAmount: 0 }],
      },
      // Simple declarative policy rules, evaluated by aiService.checkPolicyViolations()
      policyRules: {
        maxExpenseAmount: { type: Number, default: null }, // null = no cap
        requireReceiptAboveAmount: { type: Number, default: 25 },
        blockFutureDatedExpenses: { type: Boolean, default: true },
        maxExpenseAgeDays: { type: Number, default: 90 }, // reject expenses older than N days
      },
    },
  },
  { timestamps: true }
);

organizationSchema.index({ status: 1 });

export default mongoose.model("Organization", organizationSchema);
