import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { audit } from "../services/auditService.js";
import { createCategoryValidation, updateCategoryValidation } from "../validators/categoryValidators.js";
import { createCategory, getCategories, updateCategory, deleteCategory } from "../controllers/categoryController.js";

const router = express.Router();
router.use(protect);

router.post("/", authorize("org_admin"), createCategoryValidation, audit("category.create", "Category"), createCategory);
router.get("/", getCategories); // every role can read (needed to populate expense forms)
router.put("/:id", authorize("org_admin"), updateCategoryValidation, audit("category.update", "Category"), updateCategory);
router.delete("/:id", authorize("org_admin"), audit("category.delete", "Category"), deleteCategory);

export default router;
