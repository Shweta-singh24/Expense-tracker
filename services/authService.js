import crypto from "crypto";
import bcrypt from "bcryptjs";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} from "../utils/jwt.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/sendEmail.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

// ─── Helpers ────────────────────────────────────────────────────────────────

const hashToken = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

const buildUserPayload = (user, org) => ({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  },
  organization: {
    id: org._id,
    name: org.name,
    email: org.email,
  },
});

// ─── Register ────────────────────────────────────────────────────────────────

export const registerService = async (body) => {
  const { orgName, orgEmail, orgPhone, orgLogo, orgAddress, adminName, adminEmail, password, acceptTerms } = body;

  // Uniqueness checks
  const [orgExists, userExists] = await Promise.all([
    Organization.findOne({ email: orgEmail }),
    User.findOne({ email: adminEmail }),
  ]);
  if (orgExists) throw { status: 409, message: "Organization email already registered" };
  if (userExists) throw { status: 409, message: "Admin email already registered" };

  // Create organization
  const org = await Organization.create({
    name: orgName,
    email: orgEmail,
    phone: orgPhone,
    logo: orgLogo || null,
    address: orgAddress || null,
  });

  // Generate email verification token
  const { rawToken, hashedToken } = User.generateToken();

  // Create admin user
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    name: adminName,
    email: adminEmail,
    passwordHash,
    role: "org_admin",
    organizationId: org._id,
    acceptedTerms: acceptTerms === "true" || acceptTerms === true,
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
  });

  // Non-blocking — email failure should not roll back a successful registration
  sendVerificationEmail(adminEmail, adminName, rawToken).catch((err) =>
    console.error("[Email] Verification email failed:", err.message)
  );

  const isDev = process.env.NODE_ENV === "development";

  return {
    message: "Organization registered. Please verify your email.",
    orgId: org._id,
    userId: user._id,
    // Exposed only in development for Postman testing — never in production
    ...(isDev && { devVerificationToken: rawToken }),
  };
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const loginService = async (body, res) => {
  const { email, password, rememberMe } = body;

  const user = await User.findOne({ email }).populate("organizationId");
  if (!user) throw { status: 401, message: "Invalid email or password" };

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw { status: 401, message: "Invalid email or password" };

  if (!user.isEmailVerified) throw { status: 403, message: "Please verify your email before logging in" };
  if (!user.isActive) throw { status: 403, message: "Your account has been deactivated. Contact support." };

  const payload = { userId: user._id, role: user.role, orgId: user.organizationId._id };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload, !!rememberMe);

  // Store refresh token (keep max 5 devices)
  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
  user.lastLogin = new Date();
  await user.save();

  setRefreshCookie(res, refreshToken, !!rememberMe);

  return { accessToken, refreshToken, ...buildUserPayload(user, user.organizationId) };
};

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logoutService = async (token, res) => {
  clearRefreshCookie(res);
  if (!token) return;

  try {
    const { userId } = verifyRefreshToken(token);
    const user = await User.findById(userId);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
      await user.save();
    }
  } catch {
    // Token invalid — still clear cookie, no error exposed
  }
};

// ─── Forgot Password ─────────────────────────────────────────────────────────

export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  // Always return success to prevent email enumeration
  if (!user) return;

  const { rawToken, hashedToken } = User.generateToken();
  user.passwordResetToken = hashedToken;
  user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await user.save();

  // Non-blocking — email failure should not expose internal errors to the caller
  sendPasswordResetEmail(email, user.name, rawToken).catch((err) =>
    console.error("[Email] Password reset email failed:", err.message)
  );

  // Exposed only in development for Postman testing — never in production
  if (process.env.NODE_ENV === "development") return { devResetToken: rawToken };
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPasswordService = async ({ token, newPassword }) => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: Date.now() },
  });
  if (!user) throw { status: 400, message: "Invalid or expired reset token" };

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordResetToken = null;
  user.passwordResetExpiry = null;
  user.refreshTokens = []; // Invalidate all sessions on password reset
  await user.save();
};

// ─── Verify Email ─────────────────────────────────────────────────────────────

export const verifyEmailService = async (token) => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });
  if (!user) throw { status: 400, message: "Invalid or expired verification token" };

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpiry = null;
  await user.save();
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

export const refreshTokenService = async (token, res) => {
  if (!token) throw { status: 401, message: "No refresh token provided" };

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw { status: 401, message: "Invalid or expired refresh token" };
  }

  const user = await User.findById(payload.userId).populate("organizationId");
  if (!user || !user.refreshTokens.includes(token)) {
    throw { status: 401, message: "Refresh token not recognized" };
  }

  // Rotate refresh token
  const newRefreshToken = signRefreshToken({ userId: user._id, role: user.role, orgId: user.organizationId._id });
  const newAccessToken = signAccessToken({ userId: user._id, role: user.role, orgId: user.organizationId._id });

  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  setRefreshCookie(res, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
