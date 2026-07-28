import IORedis from "ioredis";

// Single shared Redis connection reused by every BullMQ queue/worker.
// BullMQ requires maxRetriesPerRequest: null on the connection it manages.
let connection = null;

export const getRedisConnection = () => {
  if (connection) return connection;
  connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: null,
  });
  connection.on("error", (err) => console.error("[Redis] Connection error:", err.message));
  return connection;
};

export default getRedisConnection;
