import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { actOnApprovalService, listMyPendingApprovalsService, listApprovalHistoryForExpense } from "../services/approvalService.js";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 422, "Validation failed", errors.array());
    return false;
  }
  return true;
};

export const actOnApproval = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const { action, comment } = req.body;
    const expense = await actOnApprovalService(req.organizationId, req.params.expenseId, req.user._id, action, comment);
    return successResponse(res, 200, `Expense ${action}d successfully`, expense);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to act on approval");
  }
};

export const getMyPendingApprovals = async (req, res) => {
  try {
    const approvals = await listMyPendingApprovalsService(req.organizationId, req.user._id);
    return successResponse(res, 200, "Pending approvals fetched successfully", approvals);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch pending approvals");
  }
};

export const getApprovalHistory = async (req, res) => {
  try {
    const history = await listApprovalHistoryForExpense(req.organizationId, req.params.expenseId);
    return successResponse(res, 200, "Approval history fetched successfully", history);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch approval history");
  }
};
