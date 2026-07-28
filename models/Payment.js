import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    reimbursementId: { type: mongoose.Schema.Types.ObjectId, ref: "Reimbursement", required: true },
    method: { type: String, enum: ["bank_transfer", "payroll", "wallet", "cash"], default: "bank_transfer" },
    transactionRef: { type: String, default: null }, // external payment gateway reference
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
