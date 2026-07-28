import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { audit } from "../services/auditService.js";
import { actOnApprovalValidation } from "../validators/approvalValidators.js";
import { actOnApproval, getMyPendingApprovals, getApprovalHistory } from "../controllers/approvalController.js";

const router = express.Router();
router.use(protect);

router.get("/pending", authorize("manager", "org_admin"), getMyPendingApprovals);
router.get("/:expenseId/history", getApprovalHistory);
router.post("/:expenseId/action", authorize("manager", "org_admin"), actOnApprovalValidation, audit("expense.approval_action", "Expense"), actOnApproval);

export default router;
