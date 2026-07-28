import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  createCategoryService,
  listCategoriesService,
  updateCategoryService,
  deleteCategoryService,
} from "../services/categoryService.js";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 422, "Validation failed", errors.array());
    return false;
  }
  return true;
};

export const createCategory = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const cat = await createCategoryService(req.organizationId, req.body);
    req.auditTargetId = cat._id;
    return successResponse(res, 201, "Category created successfully", cat);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to create category");
  }
};

export const getCategories = async (req, res) => {
  try {
    const cats = await listCategoriesService(req.organizationId);
    return successResponse(res, 200, "Categories fetched successfully", cats);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch categories");
  }
};

export const updateCategory = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const cat = await updateCategoryService(req.organizationId, req.params.id, req.body);
    return successResponse(res, 200, "Category updated successfully", cat);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update category");
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await deleteCategoryService(req.organizationId, req.params.id);
    return successResponse(res, 200, "Category deleted successfully");
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to delete category");
  }
};
