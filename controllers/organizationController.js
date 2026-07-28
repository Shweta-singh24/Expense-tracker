import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { getMyOrganizationService, updateOrganizationService, updateOrganizationSettingsService } from "../services/organizationService.js";

export const getMyOrganization = async (req, res) => {
  try {
    const org = await getMyOrganizationService(req.organizationId);
    return successResponse(res, 200, "Organization fetched successfully", org);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to fetch organization");
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const org = await updateOrganizationService(req.organizationId, req.body);
    return successResponse(res, 200, "Organization updated successfully", org);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update organization");
  }
};

export const updateOrganizationSettings = async (req, res) => {
  try {
    const org = await updateOrganizationSettingsService(req.organizationId, req.body);
    return successResponse(res, 200, "Organization settings updated successfully", org);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update settings");
  }
};
