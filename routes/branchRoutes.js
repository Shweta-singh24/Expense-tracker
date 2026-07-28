import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { audit } from "../services/auditService.js";
import { createBranchValidation, updateBranchValidation } from "../validators/branchValidators.js";
import { createBranch, getBranches, getBranch, updateBranch, deleteBranch } from "../controllers/branchController.js";

const router = express.Router();
router.use(protect);

router.post("/", authorize("org_admin"), createBranchValidation, audit("branch.create", "Branch"), createBranch);
router.get("/", getBranches);
router.get("/:id", getBranch);
router.put("/:id", authorize("org_admin"), updateBranchValidation, audit("branch.update", "Branch"), updateBranch);
router.delete("/:id", authorize("org_admin"), audit("branch.delete", "Branch"), deleteBranch);

export default router;
