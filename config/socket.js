import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";

let io = null;

/**
 * Initializes Socket.io on top of the existing HTTP server. Each client
 * authenticates with the same JWT access token used for REST calls, then
 * joins two rooms: `user:<id>` for personal notifications and
 * `org:<id>` for org-wide broadcasts (budget alerts, announcements).
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) return next(new Error("No token provided"));
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      socket.orgId = decoded.orgId;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    if (socket.orgId) socket.join(`org:${socket.orgId}`);

    socket.on("disconnect", () => {
      // no-op — room membership is cleaned up automatically by socket.io
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized — call initSocket(httpServer) first");
  return io;
};

/** Emits a real-time event to a single user's personal room. */
export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

/** Emits a real-time event to every connected member of an organization. */
export const emitToOrg = (organizationId, event, payload) => {
  if (!io) return;
  io.to(`org:${organizationId}`).emit(event, payload);
};
