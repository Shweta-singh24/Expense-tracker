import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { emailQueue, defaultJobOptions } from "../config/queue.js";
import { emitToUser, emitToOrg } from "../config/socket.js";

/**
 * Creates a notification, pushes it in real time over Socket.io, and
 * enqueues an email as a background job (doc module 14: "Real-time
 * (Socket.io) + email notifications").
 */
export const createNotification = async ({ organizationId, userId = null, type, title, message, relatedEntityId = null, broadcastToOrg = false, emailAlso = true }) => {
  const notification = await Notification.create({ organizationId, userId, type, title, message, relatedEntityId });

  if (broadcastToOrg) {
    emitToOrg(organizationId, "notification:new", notification);
  } else if (userId) {
    emitToUser(userId, "notification:new", notification);
  }

  if (emailAlso) {
    if (userId) {
      await emailQueue.add("send", { userId: String(userId), title, message }, defaultJobOptions);
    } else if (broadcastToOrg) {
      const users = await User.find({ organizationId, status: "active" }).select("_id");
      await Promise.all(
        users.map((u) => emailQueue.add("send", { userId: String(u._id), title, message }, defaultJobOptions))
      );
    }
  }

  return notification;
};

export const listNotificationsService = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const filter = { userId };
  if (unreadOnly) filter.isRead = false;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, isRead: false }),
  ]);
  return { items, total, unreadCount, page: Number(page), limit: Number(limit) };
};

export const markNotificationReadService = async (userId, id) => {
  const notif = await Notification.findOneAndUpdate({ _id: id, userId }, { isRead: true }, { new: true });
  if (!notif) throw { status: 404, message: "Notification not found" };
  return notif;
};

export const markAllReadService = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
};
