import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { audit } from "../services/auditService.js";
import { createExpenseValidation, updateExpenseValidation } from "../validators/expValidators.js";
import {
  createExp,
  getExps,
  getExp,
  updateExp,
  deleteExp,
  uploadReceipt,
  submitExp,
  monthlyReport,
} from "../controllers/expController.js";

const router = express.Router();
router.use(protect);

// Module 6: Expense Management (create/edit/delete/categorize, attach receipts, track status)
router.post("/", upload.single("receipt"), createExpenseValidation, audit("expense.create", "Expense"), createExp);

// Module 18: Search & Filters — status, categoryId, employeeId, departmentId,
// startDate/endDate, search (keyword) and page/limit are all read from req.query.
router.get("/", getExps);
router.get("/report", monthlyReport);
router.get("/:id", getExp);

router.put("/:id", updateExpenseValidation, audit("expense.update", "Expense"), updateExp);
router.delete("/:id", audit("expense.delete", "Expense"), deleteExp);

// Module 7: Receipt Management — attach an additional receipt after creation.
router.post("/:id/receipt", upload.single("receipt"), audit("expense.receipt_upload", "Expense"), uploadReceipt);

// Module 10: Approval Workflow entry point — draft/rejected -> pending_approval.
router.post("/:id/submit", audit("expense.submit", "Expense"), submitExp);

export default router;
