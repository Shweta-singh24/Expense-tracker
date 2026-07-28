import AuditLog from "../models/AuditLog.js";

/**
 * Fire-and-forget audit log writer. Never throws — a logging failure must
 * never break the primary request flow.
 * @param {object} p
 * @param {string|null} p.organizationId
 * @param {string|null} p.actorId
 * @param {string|null} p.actorRole
 * @param {string} p.action        e.g. "expense.approve"
 * @param {string} p.targetType    e.g. "Expense"
 * @param {string|null} p.targetId
 * @param {object} [p.metadata]
 * @param {string|null} [p.ip]
 */
export const logAudit = async ({ organizationId = null, actorId = null, actorRole = null, action, targetType, targetId = null, metadata = {}, ip = null }) => {
  try {
    await AuditLog.create({ organizationId, actorId, actorRole, action, targetType, targetId, metadata, ip });
  } catch (err) {
    console.error("[AuditLog] Failed to write audit log:", err.message);
  }
};

/**
 * Express middleware factory — logs after the response is sent, using
 * req.user (set by `protect`) and a static action/targetType.
 * Usage: router.post("/", protect, audit("department.create", "Department"), createDept)
 * Reads req.auditTargetId (set by the controller) if present.
 */
export const audit = (action, targetType) => (req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logAudit({
        organizationId: req.user?.organizationId?._id || req.user?.organizationId || null,
        actorId: req.user?._id || null,
        actorRole: req.user?.role || null,
        action,
        targetType,
        targetId: req.auditTargetId || req.params?.id || null,
        metadata: { method: req.method, path: req.originalUrl },
        ip: req.ip,
      });
    }
  });
  next();
};

export const getActivityTimeline = async ({ organizationId, actorId, targetType, page = 1, limit = 20 }) => {
  const filter = {};
  if (organizationId) filter.organizationId = organizationId;
  if (actorId) filter.actorId = actorId;
  if (targetType) filter.targetType = targetType;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(Number(limit)).populate("actorId", "name email role"),
    AuditLog.countDocuments(filter),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
};
