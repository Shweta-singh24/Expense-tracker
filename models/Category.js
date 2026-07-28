import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    // null organizationId = platform default category, visible to every org
    // (Super Admin managed, per doc section 6.5). Non-null = org's custom category.
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    name: { type: String, required: [true, "Category name is required"], trim: true, maxlength: 100 },
    icon: { type: String, default: null },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ organizationId: 1, name: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
