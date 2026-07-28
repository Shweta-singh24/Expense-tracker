import nodemailer from "nodemailer";

/**
 * Create transporter lazily so it always reads the latest env values.
 * Supports Gmail (SMTP) and Ethereal (dev/test fallback).
 */
const getTransporter = () => {
  // Ethereal fallback for development when real SMTP creds are not set
  if (!process.env.SMTP_USER || process.env.SMTP_USER === "your_email@gmail.com") {
    // Ethereal is a fake SMTP — emails are captured at https://ethereal.email
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER || "",
        pass: process.env.ETHEREAL_PASS || "",
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,       // smtp.gmail.com
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,                     // STARTTLS on port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,     // Gmail App Password (not your login password)
    },
  });
};

const FROM = () => `"ExpenseFlow Enterprise" <${process.env.SMTP_USER || "noreply@expenseflow.com"}>`;

/**
 * Send email verification link.
 */
export const sendVerificationEmail = async (toEmail, userName, token) => {
  const link = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await getTransporter().sendMail({
    from: FROM(),
    to: toEmail,
    subject: "Verify your ExpenseFlow account",
    html: `
      <h2>Welcome, ${userName}!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${link}" style="padding:10px 20px;background:#4F46E5;color:#fff;border-radius:5px;text-decoration:none;">
        Verify Email
      </a>
      <p>This link expires in <strong>24 hours</strong>.</p>
      <p>If you did not create this account, please ignore this email.</p>
    `,
  });
};

/**
 * Send password reset email.
 */
export const sendPasswordResetEmail = async (toEmail, userName, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await getTransporter().sendMail({
    from: FROM(),
    to: toEmail,
    subject: "Reset your ExpenseFlow password",
    html: `
      <h2>Hi, ${userName}</h2>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <a href="${link}" style="padding:10px 20px;background:#DC2626;color:#fff;border-radius:5px;text-decoration:none;">
        Reset Password
      </a>
      <p>This link expires in <strong>1 hour</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
};

/**
 * Generic transactional email used by the Notification Center's background
 * email worker for approvals, budget alerts, reimbursements, etc.
 */
export const sendGenericNotificationEmail = async (toEmail, userName, title, message) => {
  await getTransporter().sendMail({
    from: FROM(),
    to: toEmail,
    subject: title,
    html: `
      <h2>Hi, ${userName || "there"}</h2>
      <p>${message}</p>
      <hr />
      <p style="color:#888;font-size:12px;">This is an automated notification from ExpenseFlow Enterprise.</p>
    `,
  });
};
