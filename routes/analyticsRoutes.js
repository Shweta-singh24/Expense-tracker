import express from "express";
import { protect, requireSuperAdmin } from "../middleware/authMiddleware.js";
import { getDashboard, getPlatformDashboard, getForecast, askAssistant } from "../controllers/analyticsController.js";

const router = express.Router();
router.use(protect);

router.get("/dashboard", getDashboard); // Module 16 — role-scoped inside the service
router.get("/platform", requireSuperAdmin, getPlatformDashboard); // Module 6.9 — Super Admin only
router.get("/forecast", getForecast); // Module 15 — AI spend forecast
router.post("/assistant", askAssistant); // Module 15 — AI Q&A

export default router;
