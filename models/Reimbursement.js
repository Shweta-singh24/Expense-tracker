import mongoose from "mongoose";

const reimbursementSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    expenseId: { type: mongoose.Schema.Types.ObjectId, ref: "exp", required: true, unique: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: ["pending", "processing", "paid", "failed"], default: "pending" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
    requestedAt: { type: Date, default: Date.now },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Reimbursement", reimbursementSchema);
