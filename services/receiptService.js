import Receipt from "../models/Receipt.js";
import Exp from "../models/Exp.js";
import { ocrQueue, defaultJobOptions } from "../config/queue.js";

/**
 * Records a receipt after multer (Cloudinary storage) has already uploaded
 * the file, links it to the expense, and enqueues an async OCR job.
 * Keeping the actual upload in multer middleware (as the app already did)
 * means this stays storage-provider agnostic — swap the multer storage
 * engine for S3 without touching this function.
 */
export const attachReceiptService = async (organizationId, expenseId, userId, file) => {
  if (!file) throw { status: 400, message: "No receipt file provided" };

  const receipt = await Receipt.create({
    organizationId,
    expenseId,
    uploadedBy: userId,
    fileUrl: file.path || file.location || file.secure_url,
    storageKey: file.filename || file.key || null,
    storageProvider: file.filename ? "cloudinary" : "s3",
    fileType: file.mimetype || null,
    fileSizeKB: file.size ? Math.round(file.size / 1024) : null,
  });

  await Exp.findByIdAndUpdate(expenseId, { $push: { receiptIds: receipt._id } });

  await ocrQueue.add("extract", { receiptId: String(receipt._id) }, defaultJobOptions);

  return receipt;
};

export const listReceiptsForExpense = async (organizationId, expenseId) =>
  Receipt.find({ organizationId, expenseId }).sort({ uploadedAt: -1 });

export const getReceiptService = async (organizationId, id) => {
  const receipt = await Receipt.findOne({ _id: id, organizationId });
  if (!receipt) throw { status: 404, message: "Receipt not found" };
  return receipt;
};

export const deleteReceiptService = async (organizationId, id) => {
  const receipt = await Receipt.findOneAndDelete({ _id: id, organizationId });
  if (!receipt) throw { status: 404, message: "Receipt not found" };
  await Exp.findByIdAndUpdate(receipt.expenseId, { $pull: { receiptIds: receipt._id } });
  return receipt;
};

/** Called by the OCR worker once extraction finishes. */
export const saveOcrResultService = async (receiptId, ocrData, status = "completed") => {
  await Receipt.findByIdAndUpdate(receiptId, { ocrData, ocrStatus: status });
};
