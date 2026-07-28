import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    expenseId: { type: mongoose.Schema.Types.ObjectId, ref: "exp", required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    fileUrl: { type: String, required: true },
    storageKey: { type: String, default: null }, // S3 object key, or Cloudinary public_id
    storageProvider: { type: String, enum: ["s3", "cloudinary"], default: "cloudinary" },
    fileType: { type: String, default: null },
    fileSizeKB: { type: Number, default: null },

    ocrStatus: { type: String, enum: ["pending", "processing", "completed", "failed"], default: "pending" },
    ocrData: {
      vendor: { type: String, default: null },
      amount: { type: Number, default: null },
      date: { type: Date, default: null },
      rawText: { type: String, default: null },
    },

    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Receipt", receiptSchema);
