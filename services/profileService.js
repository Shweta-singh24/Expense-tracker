import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

// ─── Fields that are NEVER allowed to be updated via profile endpoint ─────────
const READ_ONLY_FIELDS = ["email", "employeeId", "role", "departmentId", "branchId", "organizationId", "isActive"];

// ─── Shape the user document into a clean profile response ───────────────────
const formatProfile = (user) => ({
  personal: {
    profileImage: user.profileImage?.url || null,
    name: user.name,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    address: user.address,
  },
  professional: {
    employeeId: user.employeeId,
    department: user.departmentId,
    branch: user.branchId,
    designation: user.designation,
    role: user.role,
  },
  organization: user.organizationId,
  account: {
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  },
});

// ─── 1. Get My Profile ────────────────────────────────────────────────────────
export const getMyProfileService = async (userId, orgId) => {
  const user = await User.findOne({ _id: userId, organizationId: orgId })
    .select("-passwordHash -refreshTokens -emailVerificationToken -emailVerificationExpiry -passwordResetToken -passwordResetExpiry")
    .populate("organizationId", "name email phone logo address")
    .populate("departmentId", "name")
    .populate("branchId", "name");

  if (!user) throw { status: 404, message: "Profile not found" };
  return formatProfile(user);
};

// ─── 2. Update Profile ────────────────────────────────────────────────────────
export const updateProfileService = async (userId, orgId, updates) => {
  // Strip any read-only fields silently
  READ_ONLY_FIELDS.forEach((field) => delete updates[field]);

  const user = await User.findOne({ _id: userId, organizationId: orgId });
  if (!user) throw { status: 404, message: "Profile not found" };

  Object.assign(user, updates);
  user.profileUpdatedAt = new Date();
  await user.save();

  return formatProfile(
    await user.populate([
      { path: "organizationId", select: "name email phone logo address" },
      { path: "departmentId", select: "name" },
      { path: "branchId", select: "name" },
    ])
  );
};

// ─── 3. Upload Profile Image ──────────────────────────────────────────────────
export const uploadProfileImageService = async (userId, orgId, file) => {
  if (!file) throw { status: 400, message: "No image file provided" };

  const user = await User.findOne({ _id: userId, organizationId: orgId });
  if (!user) throw { status: 404, message: "Profile not found" };

  // Delete previous image from Cloudinary before saving new one
  if (user.profileImage?.publicId) {
    await deleteFromCloudinary(user.profileImage.publicId);
  }

  // Cloudinary upload sets file.path (URL) and file.filename (public_id)
  // Local disk upload sets file.path as local path
  const isCloudinary = process.env.NODE_ENV === "production";

  user.profileImage = {
    url: isCloudinary ? file.path : `/uploads/profiles/${file.filename}`,
    publicId: isCloudinary ? file.filename : null,
  };
  user.profileUpdatedAt = new Date();
  await user.save();

  return { profileImage: user.profileImage.url };
};

// ─── 4. Delete Profile Image ──────────────────────────────────────────────────
export const deleteProfileImageService = async (userId, orgId) => {
  const user = await User.findOne({ _id: userId, organizationId: orgId });
  if (!user) throw { status: 404, message: "Profile not found" };

  if (!user.profileImage?.url) throw { status: 400, message: "No profile image to delete" };

  await deleteFromCloudinary(user.profileImage.publicId);

  user.profileImage = { url: null, publicId: null };
  user.profileUpdatedAt = new Date();
  await user.save();
};

// ─── 5. Change Password ───────────────────────────────────────────────────────
export const changePasswordService = async (userId, orgId, { currentPassword, newPassword }) => {
  // Fetch with passwordHash explicitly (normally excluded)
  const user = await User.findOne({ _id: userId, organizationId: orgId }).select("+passwordHash");
  if (!user) throw { status: 404, message: "Profile not found" };

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) throw { status: 401, message: "Current password is incorrect" };

  if (await bcrypt.compare(newPassword, user.passwordHash)) {
    throw { status: 400, message: "New password must be different from the current password" };
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordChangedAt = new Date();
  user.refreshTokens = []; // Invalidate all active sessions
  await user.save();
};

// ─── 6. Profile Activity ─────────────────────────────────────────────────────
export const getProfileActivityService = async (userId, orgId) => {
  const user = await User.findOne({ _id: userId, organizationId: orgId })
    .select("lastLogin passwordChangedAt profileUpdatedAt createdAt");

  if (!user) throw { status: 404, message: "Profile not found" };

  return {
    lastLogin: user.lastLogin,
    passwordChangedAt: user.passwordChangedAt,
    profileUpdatedAt: user.profileUpdatedAt,
    accountCreatedAt: user.createdAt,
  };
};
