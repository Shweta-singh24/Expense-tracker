import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true }, // e.g. "Free", "Pro", "Enterprise"
    price: { type: Number, required: true, min: 0 }, // per month, in the platform's billing currency
    storageLimitGB: { type: Number, required: true, min: 0 },
    aiCreditLimit: { type: Number, required: true, min: 0 },
    maxUsers: { type: Number, required: true, min: 1 },
    features: [{ type: String }], // e.g. ["multi_level_approval", "ai_assistant", "custom_reports"]
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
