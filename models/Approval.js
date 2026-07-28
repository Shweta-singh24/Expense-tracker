import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    expenseId: { type: mongoose.Schema.Types.ObjectId, ref: "exp", required: true, index: true },
    level: { type: Number, required: true },
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    comment: { type: String, trim: true, default: null },
    actionedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

approvalSchema.index({ expenseId: 1, level: 1 });
approvalSchema.index({ approverId: 1, status: 1 });

export default mongoose.model("Approval", approvalSchema);
