import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: [true, "Department name is required"], trim: true, maxlength: 100 },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    allocatedBudget: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

departmentSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export default mongoose.model("Department", departmentSchema);
