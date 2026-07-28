import Organization from "../models/Organization.js";
import User from "../models/User.js";

// ─── 6.3 Organization Management (platform-wide) ───────────────────────────
export const listOrganizationsService = async ({ status, search, page = 1, limit = 20 } = {}) => {
  const query = {};
  if (status) query.status = status;
  if (search) query.name = { $regex: search, $options: "i" };
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Organization.find(query).populate("subscriptionPlanId", "name").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Organization.countDocuments(query),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
};

export const setOrganizationStatusService = async (id, status) => {
  if (!["active", "suspended", "trial"].includes(status)) throw { status: 400, message: "Invalid status" };
  const org = await Organization.findByIdAndUpdate(id, { status, isActive: status !== "suspended" }, { new: true });
  if (!org) throw { status: 404, message: "Organization not found" };
  if (status === "suspended") {
    // Force-logout every user in a suspended org.
    await User.updateMany({ organizationId: id }, { refreshTokens: [] });
  }
  return org;
};

export const getOrganizationUsageService = async (id) => {
  const org = await Organization.findById(id).populate("subscriptionPlanId");
  if (!org) throw { status: 404, message: "Organization not found" };
  const userCount = await User.countDocuments({ organizationId: id });
  return {
    organization: org.name,
    plan: org.subscriptionPlanId?.name || "No plan assigned",
    userCount,
    maxUsers: org.subscriptionPlanId?.maxUsers ?? null,
    storageUsedMB: org.storageUsedMB,
    storageLimitGB: org.subscriptionPlanId?.storageLimitGB ?? null,
    aiCreditsUsed: org.aiCreditsUsed,
    aiCreditLimit: org.subscriptionPlanId?.aiCreditLimit ?? null,
  };
};

// ─── 6.2 User Management (platform-wide) ────────────────────────────────────
export const listAllUsersService = async ({ search, page = 1, limit = 20 } = {}) => {
  const query = {};
  if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    User.find(query).select("-passwordHash -refreshTokens").populate("organizationId", "name").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
};

export const setAnyUserStatusService = async (id, status) => {
  const update = { status, isActive: status === "active" };
  if (status === "suspended") update.refreshTokens = [];
  const user = await User.findByIdAndUpdate(id, update, { new: true }).select("-passwordHash -refreshTokens");
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};

// ─── 6.8 Security Center ────────────────────────────────────────────────────
export const getSecurityOverviewService = async () => {
  const [lockedAccounts, recentLogins, suspendedUsers] = await Promise.all([
    User.find({ failedLoginAttempts: { $gte: 5 } }).select("name email lastLogin").limit(50),
    User.find({ lastLogin: { $ne: null } }).select("name email lastLogin").sort({ lastLogin: -1 }).limit(50),
    User.countDocuments({ status: "suspended" }),
  ]);
  return { lockedAccounts, recentLogins, suspendedUserCount: suspendedUsers };
};

// ─── 6.11 System Settings (in-memory feature flags for demo purposes) ──────
const systemSettings = {
  maintenanceMode: false,
  maxUploadSizeMB: Number(process.env.MAX_UPLOAD_SIZE_MB) || 10,
  featureFlags: { aiAssistant: true, multiLevelApproval: true },
};
export const getSystemSettingsService = () => systemSettings;
export const updateSystemSettingsService = (patch) => {
  Object.assign(systemSettings, patch);
  return systemSettings;
};
