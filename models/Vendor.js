import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: [true, "Vendor name is required"], trim: true, maxlength: 150 },
    category: { type: String, trim: true, default: null }, // free-text vendor category (e.g. "Airline", "SaaS")
    contactInfo: {
      email: { type: String, trim: true, default: null },
      phone: { type: String, trim: true, default: null },
      address: { type: String, trim: true, default: null },
    },
    totalSpend: { type: Number, default: 0, min: 0 }, // maintained incrementally by expenseService on approval
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vendorSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export default mongoose.model("Vendor", vendorSchema);
