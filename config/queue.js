import { Queue } from "bullmq";
import { getRedisConnection } from "./redis.js";

// Every background job in the platform goes through one of these named
// queues (doc rule #4: "All async/slow work goes through BullMQ, not the
// request thread"). Workers for each are started from workers/index.js.
const connection = getRedisConnection();

export const ocrQueue = new Queue("ocr-extraction", { connection });
export const emailQueue = new Queue("email-notifications", { connection });
export const reportQueue = new Queue("report-generation", { connection });
export const aiQueue = new Queue("ai-processing", { connection });

export const defaultJobOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 5000 },
  removeOnComplete: 100,
  removeOnFail: 500,
};
