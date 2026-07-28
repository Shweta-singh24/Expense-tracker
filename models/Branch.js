import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: [true, "Branch name is required"], trim: true, maxlength: 100 },
    location: { type: String, trim: true, default: null },
    allocatedBudget: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

branchSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export default mongoose.model("Branch", branchSchema);
