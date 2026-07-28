import { startOcrWorker } from "./ocrWorker.js";
import { startEmailWorker } from "./emailWorker.js";
import { startReportWorker } from "./reportWorker.js";

/**
 * Boots every BullMQ worker. Called once from server.js. Each worker
 * connects to the same Redis instance (config/redis.js) and processes its
 * own named queue — keeping OCR/email/report generation off the request
 * thread, per the doc's async architecture rule.
 */
export const startWorkers = () => {
  const workers = [startOcrWorker(), startEmailWorker(), startReportWorker()];
  console.log(`Background workers started: ocr, email, report`);
  return workers;
};
