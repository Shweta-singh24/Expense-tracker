import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    scope: { type: String, enum: ["department", "branch", "project", "org"], required: true },
    scopeRefId: { type: mongoose.Schema.Types.ObjectId, default: null }, // null when scope === "org"
    projectName: { type: String, trim: true, default: null }, // used when scope === "project"

    period: { type: String, enum: ["monthly", "quarterly", "yearly"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    allocatedAmount: { type: Number, required: true, min: 0 },
    spentAmount: { type: Number, default: 0, min: 0 },
    alertThresholdPercent: { type: Number, default: 80, min: 1, max: 100 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

budgetSchema.index({ organizationId: 1, scope: 1, scopeRefId: 1, startDate: 1 });

budgetSchema.virtual("utilizationPercent").get(function () {
  return this.allocatedAmount > 0 ? Math.round((this.spentAmount / this.allocatedAmount) * 100) : 0;
});
budgetSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Budget", budgetSchema);
