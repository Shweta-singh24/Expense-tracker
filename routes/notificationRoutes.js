import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getNotifications, markNotificationRead, markAllRead } from "../controllers/notificationController.js";

const router = express.Router();
router.use(protect);

router.get("/", getNotifications);
router.put("/:id/read", markNotificationRead);
router.put("/read-all", markAllRead);

export default router;
