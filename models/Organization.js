import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Organization email is required"],
      unique: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Organization phone is required"],
      trim: true,
    },
    logo: {
      type: String, // Cloudinary URL (optional)
      default: null,
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Organization", organizationSchema);
