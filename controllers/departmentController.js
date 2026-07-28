import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  createDepartmentService,
  listDepartmentsService,
  getDepartmentService,
  updateDepartmentService,
  deleteDepartmentService,
} from "../services/departmentService.js";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 422, "Validation failed", errors.array());
    return false;
  }
  return true;
};

export const createDepartment = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const dept = await createDepartmentService(req.organizationId, req.body);
    req.auditTargetId = dept._id;
    return successResponse(res, 201, "Department created successfully", dept);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to create department");
  }
};

export const getDepartments = async (req, res) => {
  try {
    const depts = await listDepartmentsService(req.organizationId);
    return successResponse(res, 200, "Departments fetched successfully", depts);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch departments");
  }
};

export const getDepartment = async (req, res) => {
  try {
    const dept = await getDepartmentService(req.organizationId, req.params.id);
    return successResponse(res, 200, "Department fetched successfully", dept);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to fetch department");
  }
};

export const updateDepartment = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const dept = await updateDepartmentService(req.organizationId, req.params.id, req.body);
    return successResponse(res, 200, "Department updated successfully", dept);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update department");
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    await deleteDepartmentService(req.organizationId, req.params.id);
    return successResponse(res, 200, "Department deleted successfully");
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to delete department");
  }
};
