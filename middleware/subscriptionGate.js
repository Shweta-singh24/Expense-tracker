import { enforcePlanLimit } from "../services/subscriptionService.js";
import { errorResponse } from "../utils/apiResponse.js";

/**
 * Route-level gate that enforces the org's subscription plan limits before
 * a metered action proceeds. Usage: subscriptionGate("user") before invite,
 * subscriptionGate("storage") before receipt upload, subscriptionGate("ai")
 * before AI assistant calls.
 */
export const subscriptionGate = (resource) => async (req, res, next) => {
  try {
    if (req.user?.role === "super_admin") return next(); // platform admin is never gated
    await enforcePlanLimit(req.organizationId, resource);
    next();
  } catch (err) {
    return errorResponse(res, err.status || 403, err.message || "Plan limit reached");
  }
};
