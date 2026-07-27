import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  registerService,
  loginService,
  logoutService,
  forgotPasswordService,
  resetPasswordService,
  verifyEmailService,
  refreshTokenService,
} from "../services/authService.js";

// Inline validation handler — reused across all controllers
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 422, "Validation failed", errors.array());
    return false;
  }
  return true;
};

// POST /api/auth/register
export const register = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const result = await registerService(req.body);
    return successResponse(res, 201, result.message, {
      orgId: result.orgId,
      userId: result.userId,
      // Only present in development — use this token to call GET /api/auth/verify-email/:token
      ...(result.devVerificationToken && { devVerificationToken: result.devVerificationToken }),
    });
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Registration failed");
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const data = await loginService(req.body, res);
    return successResponse(res, 200, "Login successful", data);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Login failed");
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    // Accept token from cookie or body
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    await logoutService(token, res);
    return successResponse(res, 200, "Logged out successfully");
  } catch (err) {
    return errorResponse(res, 500, "Logout failed");
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const result = await forgotPasswordService(req.body.email);
    return successResponse(res, 200, "If that email exists, a reset link has been sent.", {
      // Only present in development — use this token to call POST /api/auth/reset-password
      ...(result?.devResetToken && { devResetToken: result.devResetToken }),
    });
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Request failed");
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    await resetPasswordService(req.body);
    return successResponse(res, 200, "Password reset successfully. Please log in.");
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Reset failed");
  }
};

// GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    await verifyEmailService(req.params.token);
    return successResponse(res, 200, "Email verified successfully. You can now log in.");
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Verification failed");
  }
};

// POST /api/auth/refresh-token
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const data = await refreshTokenService(token, res);
    return successResponse(res, 200, "Token refreshed", data);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Token refresh failed");
  }
};
