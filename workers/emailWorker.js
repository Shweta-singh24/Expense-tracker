import { Worker } from "bullmq";
import { getRedisConnection } from "../config/redis.js";
import User from "../models/User.js";
import { sendGenericNotificationEmail } from "../utils/sendEmail.js";

export const startEmailWorker = () => {
  const worker = new Worker(
    "email-notifications",
    async (job) => {
      const { userId, title, message } = job.data;
      const user = await User.findById(userId).select("name email");
      if (!user) return;
      await sendGenericNotificationEmail(user.email, user.name, title, message);
    },
    { connection: getRedisConnection() }
  );
  worker.on("failed", (job, err) => console.error(`[Email Worker] Job ${job?.id} failed:`, err.message));
  return worker;
};
