import { Worker } from "bullmq";
import { getRedisConnection } from "../config/redis.js";
import Receipt from "../models/Receipt.js";
import { saveOcrResultService } from "../services/receiptService.js";

/**
 * Background OCR extraction worker (doc module 7: "OCR extraction —
 * amount/date/vendor"). This is a lightweight rule-based/mock extractor so
 * the pipeline is fully wired and demoable without paid OCR API credits.
 * Swap `runOcr()` for a real provider (Tesseract.js, AWS Textract, Google
 * Vision) without touching the queue/worker plumbing.
 */
const runOcr = async (fileUrl) => {
  // Placeholder deterministic "extraction" — replace with a real OCR call.
  // A real integration would download fileUrl and run it through
  // Tesseract.js or a cloud OCR API, then parse vendor/amount/date from text.
  return {
    vendor: null,
    amount: null,
    date: null,
    rawText: `[OCR not configured] Would extract text from ${fileUrl}`,
  };
};

export const startOcrWorker = () => {
  const worker = new Worker(
    "ocr-extraction",
    async (job) => {
      const { receiptId } = job.data;
      const receipt = await Receipt.findById(receiptId);
      if (!receipt) return;

      await Receipt.findByIdAndUpdate(receiptId, { ocrStatus: "processing" });
      try {
        const ocrData = await runOcr(receipt.fileUrl);
        await saveOcrResultService(receiptId, ocrData, "completed");
      } catch (err) {
        console.error("[OCR Worker] Extraction failed:", err.message);
        await saveOcrResultService(receiptId, {}, "failed");
      }
    },
    { connection: getRedisConnection() }
  );

  worker.on("failed", (job, err) => console.error(`[OCR Worker] Job ${job?.id} failed:`, err.message));
  return worker;
};
