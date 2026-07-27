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
    if (!user.isActive) return errorResponse(res, 403, "Account deactivated");

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 500, "Server error in auth middleware");
  }
};

/**
 * Role-based authorization middleware.
 * Usage: authorize("org_admin", "manager")
 * @param {...string} roles
 */
export const authorize = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return errorResponse(res, 403, "You do not have permission to perform this action");
    }
    next();
  };
