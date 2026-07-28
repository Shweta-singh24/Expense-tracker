import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  inviteUserService,
  listUsersService,
  getUserService,
  updateUserService,
  setUserStatusService,
  deleteUserService,
} from "../services/userService.js";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 422, "Validation failed", errors.array());
    return false;
  }
  return true;
};

export const inviteUser = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const user = await inviteUserService(req.organizationId, req.body);
    req.auditTargetId = user._id;
    return successResponse(res, 201, "User invited successfully", { id: user._id, email: user.email });
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to invite user");
  }
};

export const getUsers = async (req, res) => {
  try {
    const data = await listUsersService(req.organizationId, req.query);
    return successResponse(res, 200, "Users fetched successfully", data);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch users");
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await getUserService(req.organizationId, req.params.id);
    return successResponse(res, 200, "User fetched successfully", user);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to fetch user");
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await updateUserService(req.organizationId, req.params.id, req.body);
    return successResponse(res, 200, "User updated successfully", user);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update user");
  }
};

export const setUserStatus = async (req, res) => {
  try {
    const user = await setUserStatusService(req.organizationId, req.params.id, req.body.status);
    return successResponse(res, 200, `User status updated to "${req.body.status}"`, user);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to update user status");
  }
};

export const deleteUser = async (req, res) => {
  try {
    await deleteUserService(req.organizationId, req.params.id);
    return successResponse(res, 200, "User deleted successfully");
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to delete user");
  }
};
