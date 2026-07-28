import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: ["pending", "paid", "overdue", "cancelled"], default: "pending" },
    issuedAt: { type: Date, default: Date.now },
    paidAt: { type: Date, default: null },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
