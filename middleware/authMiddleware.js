import { verifyAccessToken } from "../utils/jwt.js";
import { errorResponse } from "../utils/apiResponse.js";
import User from "../models/User.js";

/**
 * Protect routes — verifies JWT access token.
 * Attaches req.user on success.
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return errorResponse(res, 401, "No token, authorization denied");

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return errorResponse(res, 401, "Invalid or expired access token");
    }

    const user = await User.findById(decoded.userId).select("-passwordHash -refreshTokens").populate("organizationId");
    if (!user) return errorResponse(res, 401, "User not found");
    if (!user.isActive || user.status === "suspended") return errorResponse(res, 403, "Account deactivated");

    req.user = user;
    // Convenience string id used by every tenant-scoped query. null for super_admin.
    req.organizationId = user.organizationId?._id ? String(user.organizationId._id) : null;
    next();
  } catch (err) {
    return errorResponse(res, 500, "Server error in auth middleware");
  }
};

/**
 * Role-based authorization middleware.
 * Usage: authorize("org_admin", "manager")
 * super_admin always passes — platform admin outranks every tenant role.
 * @param {...string} roles
 */
export const authorize = (...roles) =>
  (req, res, next) => {
    if (req.user?.role === "super_admin") return next();
    if (!roles.includes(req.user?.role)) {
      return errorResponse(res, 403, "You do not have permission to perform this action");
    }
    next();
  };

/**
 * Restricts a route to the Super Admin only (platform-wide operations —
 * Section 6 of the doc: org approval/suspension, subscription plans, etc.).
 */
export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "super_admin") {
    return errorResponse(res, 403, "Super Admin access required");
  }
  next();
};

/**
 * Enforces multi-tenant data isolation: a non-super_admin user may only
 * touch resources whose organizationId matches their own. Call this after
 * loading a resource, comparing resource.organizationId to req.organizationId.
 * Design rule from the doc: "Every query must filter by organizationId
 * (except Super Admin routes)."
 */
export const assertSameTenant = (resourceOrgId, req) => {
  if (req.user?.role === "super_admin") return true;
  return String(resourceOrgId) === String(req.organizationId);
};
