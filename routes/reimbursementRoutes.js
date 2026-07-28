import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { audit } from "../services/auditService.js";
import { processReimbursementValidation } from "../validators/reimbursementValidators.js";
import { getReimbursements, getReimbursement, processReimbursement } from "../controllers/reimbursementController.js";

const router = express.Router();
router.use(protect);

router.get("/", getReimbursements);
router.get("/:id", getReimbursement);
router.post("/:id/process", authorize("org_admin", "manager"), processReimbursementValidation, audit("reimbursement.process", "Reimbursement"), processReimbursement);

export default router;
