import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  listReimbursementsService,
  getReimbursementService,
  processReimbursementService,
} from "../services/reimbursementService.js";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 422, "Validation failed", errors.array());
    return false;
  }
  return true;
};

export const getReimbursements = async (req, res) => {
  try {
    const data = await listReimbursementsService(req.organizationId, req, req.query);
    return successResponse(res, 200, "Reimbursements fetched successfully", data);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch reimbursements");
  }
};

export const getReimbursement = async (req, res) => {
  try {
    const r = await getReimbursementService(req.organizationId, req.params.id);
    return successResponse(res, 200, "Reimbursement fetched successfully", r);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to fetch reimbursement");
  }
};

export const processReimbursement = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const r = await processReimbursementService(req.organizationId, req.params.id, req.body.method);
    return successResponse(res, 200, "Reimbursement processed", r);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to process reimbursement");
  }
};
