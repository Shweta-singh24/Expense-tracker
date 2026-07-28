import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getAuditLogs, getMyActivity } from "../controllers/auditController.js";

const router = express.Router();
router.use(protect);

router.get("/", authorize("org_admin"), getAuditLogs); // super_admin bypasses via authorize()
router.get("/my-activity", getMyActivity);

export default router;
