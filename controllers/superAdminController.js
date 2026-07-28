import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  listOrganizationsService,
  setOrganizationStatusService,
  getOrganizationUsageService,
  listAllUsersService,
  setAnyUserStatusService,
  getSecurityOverviewService,
  getSystemSettingsService,
  updateSystemSettingsService,
} from "../services/superAdminService.js";
import { createPlatformCategoryService } from "../services/categoryService.js";

export const getOrganizations = async (req, res) => {
  try {
    const data = await listOrganizationsService(req.query);
    return successResponse(res, 200, "Organizations fetched successfully", data);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch organizations");
  }
};

export const setOrganizationStatus = async (req, res) => {
  try {
    const org = await setOrganizationStatusService(req.params.id, req.body.status);
    return successResponse(res, 200, `Organization status updated to "${req.body.status}"`, org);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update organization status");
  }
};

export const getOrganizationUsage = async (req, res) => {
  try {
    const usage = await getOrganizationUsageService(req.params.id);
    return successResponse(res, 200, "Organization usage fetched successfully", usage);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to fetch organization usage");
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const data = await listAllUsersService(req.query);
    return successResponse(res, 200, "Users fetched successfully", data);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch users");
  }
};

export const setAnyUserStatus = async (req, res) => {
  try {
    const user = await setAnyUserStatusService(req.params.id, req.body.status);
    return successResponse(res, 200, `User status updated to "${req.body.status}"`, user);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update user status");
  }
};

export const getSecurityOverview = async (req, res) => {
  try {
    const data = await getSecurityOverviewService();
    return successResponse(res, 200, "Security overview fetched successfully", data);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch security overview");
  }
};

export const getSystemSettings = async (req, res) => successResponse(res, 200, "System settings fetched successfully", getSystemSettingsService());

export const updateSystemSettings = async (req, res) => successResponse(res, 200, "System settings updated successfully", updateSystemSettingsService(req.body));

export const createPlatformCategory = async (req, res) => {
  try {
    const cat = await createPlatformCategoryService(req.body);
    return successResponse(res, 201, "Platform category created successfully", cat);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to create platform category");
  }
};
