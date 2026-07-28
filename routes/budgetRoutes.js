import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { audit } from "../services/auditService.js";
import { createBudgetValidation, updateBudgetValidation } from "../validators/budgetValidators.js";
import { createBudget, getBudgets, getBudget, updateBudget, deleteBudget } from "../controllers/budgetController.js";

const router = express.Router();
router.use(protect);

router.post("/", authorize("org_admin"), createBudgetValidation, audit("budget.create", "Budget"), createBudget);
router.get("/", authorize("org_admin", "manager"), getBudgets);
router.get("/:id", authorize("org_admin", "manager"), getBudget);
router.put("/:id", authorize("org_admin"), updateBudgetValidation, audit("budget.update", "Budget"), updateBudget);
router.delete("/:id", authorize("org_admin"), audit("budget.delete", "Budget"), deleteBudget);

export default router;
