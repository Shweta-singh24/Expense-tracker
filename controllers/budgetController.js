import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  createBudgetService,
  listBudgetsService,
  getBudgetService,
  updateBudgetService,
  deleteBudgetService,
} from "../services/budgetService.js";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 422, "Validation failed", errors.array());
    return false;
  }
  return true;
};

export const createBudget = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const budget = await createBudgetService(req.organizationId, req.body);
    req.auditTargetId = budget._id;
    return successResponse(res, 201, "Budget created successfully", budget);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to create budget");
  }
};

export const getBudgets = async (req, res) => {
  try {
    const budgets = await listBudgetsService(req.organizationId, req.query);
    return successResponse(res, 200, "Budgets fetched successfully", budgets);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch budgets");
  }
};

export const getBudget = async (req, res) => {
  try {
    const budget = await getBudgetService(req.organizationId, req.params.id);
    return successResponse(res, 200, "Budget fetched successfully", budget);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to fetch budget");
  }
};

export const updateBudget = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const budget = await updateBudgetService(req.organizationId, req.params.id, req.body);
    return successResponse(res, 200, "Budget updated successfully", budget);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update budget");
  }
};

export const deleteBudget = async (req, res) => {
  try {
    await deleteBudgetService(req.organizationId, req.params.id);
    return successResponse(res, 200, "Budget deleted successfully");
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to delete budget");
  }
};
