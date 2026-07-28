import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  createVendorService,
  listVendorsService,
  getVendorService,
  updateVendorService,
  deleteVendorService,
} from "../services/vendorService.js";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 422, "Validation failed", errors.array());
    return false;
  }
  return true;
};

export const createVendor = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const vendor = await createVendorService(req.organizationId, req.body);
    req.auditTargetId = vendor._id;
    return successResponse(res, 201, "Vendor created successfully", vendor);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to create vendor");
  }
};

export const getVendors = async (req, res) => {
  try {
    const vendors = await listVendorsService(req.organizationId, { search: req.query.search });
    return successResponse(res, 200, "Vendors fetched successfully", vendors);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch vendors");
  }
};

export const getVendor = async (req, res) => {
  try {
    const vendor = await getVendorService(req.organizationId, req.params.id);
    return successResponse(res, 200, "Vendor fetched successfully", vendor);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to fetch vendor");
  }
};

export const updateVendor = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const vendor = await updateVendorService(req.organizationId, req.params.id, req.body);
    return successResponse(res, 200, "Vendor updated successfully", vendor);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update vendor");
  }
};

export const deleteVendor = async (req, res) => {
  try {
    await deleteVendorService(req.organizationId, req.params.id);
    return successResponse(res, 200, "Vendor deleted successfully");
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to delete vendor");
  }
};
