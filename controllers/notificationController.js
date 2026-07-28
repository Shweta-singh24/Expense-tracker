import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { listNotificationsService, markNotificationReadService, markAllReadService } from "../services/notificationService.js";

export const getNotifications = async (req, res) => {
  try {
    const data = await listNotificationsService(req.user._id, req.query);
    return successResponse(res, 200, "Notifications fetched successfully", data);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch notifications");
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notif = await markNotificationReadService(req.user._id, req.params.id);
    return successResponse(res, 200, "Notification marked as read", notif);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update notification");
  }
};

export const markAllRead = async (req, res) => {
  try {
    await markAllReadService(req.user._id);
    return successResponse(res, 200, "All notifications marked as read");
  } catch (err) {
    return errorResponse(res, 500, "Failed to update notifications");
  }
};
