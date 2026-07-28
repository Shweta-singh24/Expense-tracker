import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  createExpenseService,
  listExpensesService,
  getExpenseService,
  updateExpenseService,
  deleteExpenseService,
  submitExpenseService,
  monthlyReportService,
} from "../services/expenseService.js";
import { attachReceiptService } from "../services/receiptService.js";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 422, "Validation failed", errors.array());
    return false;
  }
  return true;
};

// POST /api/expenses
export const createExp = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    let expense = await createExpenseService(req.organizationId, req.user._id, req.body);
    if (req.file) {
      await attachReceiptService(req.organizationId, expense._id, req.user._id, req.file);
      expense = await getExpenseService(req.organizationId, expense._id);
    }
    req.auditTargetId = expense._id;
    return successResponse(res, 201, "Expense created successfully", expense);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to create expense");
  }
};

// GET /api/expenses
export const getExps = async (req, res) => {
  try {
    const data = await listExpensesService(req, req.query);
    return successResponse(res, 200, "Expenses fetched successfully", data);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch expenses");
  }
};

// GET /api/expenses/:id
export const getExp = async (req, res) => {
  try {
    const expense = await getExpenseService(req.organizationId, req.params.id);
    return successResponse(res, 200, "Expense fetched successfully", expense);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to fetch expense");
  }
};

// PUT /api/expenses/:id
export const updateExp = async (req, res) => {
  try {
    const expense = await updateExpenseService(req.organizationId, req.params.id, req.user._id, req.body);
    return successResponse(res, 200, "Expense updated successfully", expense);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update expense");
  }
};

// DELETE /api/expenses/:id
export const deleteExp = async (req, res) => {
  try {
    await deleteExpenseService(req.organizationId, req.params.id, req.user._id);
    return successResponse(res, 200, "Expense deleted successfully");
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to delete expense");
  }
};

// POST /api/expenses/:id/receipt
export const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 400, "No file uploaded");
    const receipt = await attachReceiptService(req.organizationId, req.params.id, req.user._id, req.file);
    return successResponse(res, 201, "Receipt uploaded successfully", receipt);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to upload receipt");
  }
};

// POST /api/expenses/:id/submit
export const submitExp = async (req, res) => {
  try {
    const expense = await submitExpenseService(req.organizationId, req.params.id, req.user._id);
    return successResponse(res, 200, "Expense submitted for approval", expense);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to submit expense");
  }
};

// GET /api/expenses/report
export const monthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return errorResponse(res, 400, "month and year query params are required");
    const report = await monthlyReportService(req.organizationId, req.user._id, month, year);
    return successResponse(res, 200, "Monthly report generated successfully", report);
  } catch (err) {
    return errorResponse(res, 500, "Failed to generate report");
  }
};
