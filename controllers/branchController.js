import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  createBranchService,
  listBranchesService,
  getBranchService,
  updateBranchService,
  deleteBranchService,
} from "../services/branchService.js";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 422, "Validation failed", errors.array());
    return false;
  }
  return true;
};

export const createBranch = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const branch = await createBranchService(req.organizationId, req.body);
    req.auditTargetId = branch._id;
    return successResponse(res, 201, "Branch created successfully", branch);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to create branch");
  }
};

export const getBranches = async (req, res) => {
  try {
    const branches = await listBranchesService(req.organizationId);
    return successResponse(res, 200, "Branches fetched successfully", branches);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch branches");
  }
};

export const getBranch = async (req, res) => {
  try {
    const branch = await getBranchService(req.organizationId, req.params.id);
    return successResponse(res, 200, "Branch fetched successfully", branch);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to fetch branch");
  }
};

export const updateBranch = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const branch = await updateBranchService(req.organizationId, req.params.id, req.body);
    return successResponse(res, 200, "Branch updated successfully", branch);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update branch");
  }
};

export const deleteBranch = async (req, res) => {
  try {
    await deleteBranchService(req.organizationId, req.params.id);
    return successResponse(res, 200, "Branch deleted successfully");
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to delete branch");
  }
};
