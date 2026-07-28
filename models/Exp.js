import mongoose from "mongoose";

// The hub entity of the whole platform (doc section 7). Almost every other
// module either feeds into or reads from an Expense.
const expSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },

    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1000, default: null },
    amount: { type: Number, required: [true, "Amount is required"], min: [0.01, "Amount must be greater than 0"] },
    currency: { type: String, default: "USD" }, // ISO 4217

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },

    expenseDate: { type: Date, required: true, default: Date.now },

    receiptIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Receipt" }],

    status: {
      type: String,
      enum: ["draft", "submitted", "pending_approval", "approved", "rejected", "reimbursed"],
      default: "draft",
      index: true,
    },
    currentApprovalLevel: { type: Number, default: 0 },

    // AI Assistant outputs (module 15) — populated on create/submit.
    aiCategoryConfidence: { type: Number, min: 0, max: 1, default: null },
    isDuplicateFlag: { type: Boolean, default: false },
    policyViolationFlags: [{ type: String }], // e.g. ["MISSING_RECEIPT", "OVER_POLICY_LIMIT", "FUTURE_DATED"]

    notes: { type: String, trim: true, default: null },
    rejectionReason: { type: String, trim: true, default: null },

    submittedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

expSchema.index({ organizationId: 1, employeeId: 1, status: 1 });
expSchema.index({ organizationId: 1, departmentId: 1, expenseDate: -1 });
expSchema.index({ organizationId: 1, status: 1, expenseDate: -1 });

// Text index to support Module 18 — Search & Filters (keyword search).
expSchema.index({ title: "text", description: "text", notes: "text" });

const exp = mongoose.model("exp", expSchema);
export default exp;
