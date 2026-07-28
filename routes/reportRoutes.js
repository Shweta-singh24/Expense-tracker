import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { requestReportValidation } from "../validators/reportValidators.js";
import { requestReport } from "../controllers/reportController.js";

const router = express.Router();
router.use(protect, authorize("org_admin", "manager"));

router.post("/", requestReportValidation, requestReport);

export default router;
