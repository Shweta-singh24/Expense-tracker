import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  createPlanService,
  listPlansService,
  updatePlanService,
  assignPlanToOrgService,
  listInvoicesService,
  markInvoicePaidService,
} from "../services/subscriptionService.js";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 422, "Validation failed", errors.array());
    return false;
  }
  return true;
};

export const createPlan = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const plan = await createPlanService(req.body);
    return successResponse(res, 201, "Plan created successfully", plan);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to create plan");
  }
};

export const getPlans = async (req, res) => {
  try {
    const plans = await listPlansService();
    return successResponse(res, 200, "Plans fetched successfully", plans);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch plans");
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await updatePlanService(req.params.id, req.body);
    return successResponse(res, 200, "Plan updated successfully", plan);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update plan");
  }
};

export const assignPlanToOrg = async (req, res) => {
  try {
    const org = await assignPlanToOrgService(req.params.orgId, req.body.planId);
    return successResponse(res, 200, "Plan assigned to organization", org);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to assign plan");
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await listInvoicesService(req.organizationId);
    return successResponse(res, 200, "Invoices fetched successfully", invoices);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch invoices");
  }
};

export const markInvoicePaid = async (req, res) => {
  try {
    const invoice = await markInvoicePaidService(req.organizationId, req.params.id);
    return successResponse(res, 200, "Invoice marked as paid", invoice);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update invoice");
  }
};
