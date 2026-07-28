import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { audit } from "../services/auditService.js";
import { createDepartmentValidation, updateDepartmentValidation } from "../validators/departmentValidators.js";
import {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";

const router = express.Router();
router.use(protect);

// Org Admins configure org structure; Managers/Employees only read it.
router.post("/", authorize("org_admin"), createDepartmentValidation, audit("department.create", "Department"), createDepartment);
router.get("/", getDepartments);
router.get("/:id", getDepartment);
router.put("/:id", authorize("org_admin"), updateDepartmentValidation, audit("department.update", "Department"), updateDepartment);
router.delete("/:id", authorize("org_admin"), audit("department.delete", "Department"), deleteDepartment);

export default router;
