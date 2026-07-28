import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true }, // null = org-wide broadcast
    type: {
      type: String,
      enum: [
        "expense_submitted",
        "expense_approved",
        "expense_rejected",
        "approval_required",
        "reimbursement_paid",
        "budget_alert",
        "invoice_issued",
        "account",
        "general",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    relatedEntityId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
