import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { getActivityTimeline } from "../services/auditService.js";

// GET /api/audit-logs — org-scoped for org_admin, platform-wide for super_admin
export const getAuditLogs = async (req, res) => {
  try {
    const organizationId = req.user.role === "super_admin" ? req.query.organizationId || null : req.organizationId;
    const data = await getActivityTimeline({
      organizationId,
      actorId: req.query.actorId,
      targetType: req.query.targetType,
      page: req.query.page,
      limit: req.query.limit,
    });
    return successResponse(res, 200, "Audit logs fetched successfully", data);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch audit logs");
  }
};

// GET /api/audit-logs/my-activity — chronological feed of the caller's own actions
export const getMyActivity = async (req, res) => {
  try {
    const data = await getActivityTimeline({ organizationId: req.organizationId, actorId: req.user._id, page: req.query.page, limit: req.query.limit });
    return successResponse(res, 200, "Activity timeline fetched successfully", data);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch activity timeline");
  }
};
