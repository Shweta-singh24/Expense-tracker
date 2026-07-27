import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  getMyProfileService,
  updateProfileService,
  uploadProfileImageService,
  deleteProfileImageService,
  changePasswordService,
  getProfileActivityService,
} from "../services/profileService.js";

// Reusable validation check
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 422, "Validation failed", errors.array());
    return false;
  }
  return true;
};

// GET /api/profile/me
export const getMyProfile = async (req, res) => {
  try {
    const data = await getMyProfileService(req.user._id, req.user.organizationId._id);
    return successResponse(res, 200, "Profile fetched successfully", data);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to fetch profile");
  }
};

// PUT /api/profile/update
export const updateProfile = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const data = await updateProfileService(req.user._id, req.user.organizationId._id, req.body);
    return successResponse(res, 200, "Profile updated successfully", data);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update profile");
  }
};

// POST /api/profile/upload-image
export const uploadProfileImage = async (req, res) => {
  try {
    const data = await uploadProfileImageService(req.user._id, req.user.organizationId._id, req.file);
    return successResponse(res, 200, "Profile image uploaded successfully", data);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to upload image");
  }
};

// DELETE /api/profile/delete-image
export const deleteProfileImage = async (req, res) => {
  try {
    await deleteProfileImageService(req.user._id, req.user.organizationId._id);
    return successResponse(res, 200, "Profile image deleted successfully");
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to delete image");
  }
};

// PUT /api/profile/change-password
export const changePassword = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    await changePasswordService(req.user._id, req.user.organizationId._id, req.body);
    return successResponse(res, 200, "Password changed successfully. Please log in again.");
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to change password");
  }
};

// GET /api/profile/activity
export const getProfileActivity = async (req, res) => {
  try {
    const data = await getProfileActivityService(req.user._id, req.user.organizationId._id);
    return successResponse(res, 200, "Profile activity fetched successfully", data);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to fetch activity");
  }
};
