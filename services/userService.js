import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

/**
 * Org Admin invites an employee/manager (doc module 3: "CRUD employees/
 * managers/admins, roles, permissions, activate/suspend accounts"). The
 * invited user starts in status "invited" with a random temp password and
 * must verify their email + set a password via the reset-password flow.
 */
export const inviteUserService = async (organizationId, { name, email, role, departmentId, branchId, managerId, employeeId, designation }) => {
  if (role === "super_admin") throw { status: 403, message: "Cannot invite a super_admin" };

  const exists = await User.findOne({ email });
  if (exists) throw { status: 409, message: "A user with this email already exists" };

  const tempPassword = crypto.randomBytes(12).toString("hex");
  const passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);
  const { rawToken, hashedToken } = User.generateToken();

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || "employee",
    organizationId,
    departmentId: departmentId || null,
    branchId: branchId || null,
    managerId: managerId || null,
    employeeId: employeeId || null,
    designation: designation || null,
    status: "invited",
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days to accept
  });

  sendVerificationEmail(email, name, rawToken).catch((err) => console.error("[Email] Invite email failed:", err.message));

  return user;
};

export const listUsersService = async (organizationId, { role, departmentId, status, search, page = 1, limit = 20 } = {}) => {
  const query = { organizationId };
  if (role) query.role = role;
  if (departmentId) query.departmentId = departmentId;
  if (status) query.status = status;
  if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    User.find(query).select("-passwordHash -refreshTokens").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
};

export const getUserService = async (organizationId, id) => {
  const user = await User.findOne({ _id: id, organizationId }).select("-passwordHash -refreshTokens");
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};

const PROTECTED_FIELDS = ["passwordHash", "email", "organizationId", "refreshTokens"];
export const updateUserService = async (organizationId, id, updates) => {
  PROTECTED_FIELDS.forEach((f) => delete updates[f]);
  const user = await User.findOneAndUpdate({ _id: id, organizationId }, updates, { new: true, runValidators: true }).select("-passwordHash -refreshTokens");
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};

export const setUserStatusService = async (organizationId, id, status) => {
  if (!["active", "suspended", "invited"].includes(status)) throw { status: 400, message: "Invalid status" };
  const update = { status, isActive: status === "active" };
  if (status === "suspended") update.refreshTokens = []; // force logout everywhere

  const user = await User.findOneAndUpdate({ _id: id, organizationId }, update, { new: true }).select("-passwordHash -refreshTokens");
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};

export const deleteUserService = async (organizationId, id) => {
  const user = await User.findOneAndDelete({ _id: id, organizationId });
  if (!user) throw { status: 404, message: "User not found" };
  return user;
};
