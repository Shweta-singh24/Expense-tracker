import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Route modules (Module 1-23, per project doc) ─────────────────────────────
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import expRoutes from "./routes/expRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import approvalRoutes from "./routes/approvalRoutes.js";
import reimbursementRoutes from "./routes/reimbursementRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";

import { apiLimiter } from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import swaggerSpec from "./config/swagger.js";
import { initSocket } from "./config/socket.js";
import { startWorkers } from "./workers/index.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // Allow cookies
  })
);

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
// 1. Authentication
app.use("/api/auth", authRoutes);
// Profile Module (personal profile self-service)
app.use("/api/profile", profileRoutes);
// 2. Organization Management
app.use("/api/organization", organizationRoutes);
// 3. User Management
app.use("/api/users", userRoutes);
// 4. Department Management
app.use("/api/departments", departmentRoutes);
// 5. Branch Management
app.use("/api/branches", branchRoutes);
// 8. Category Management
app.use("/api/categories", categoryRoutes);
// 12. Vendor Management
app.use("/api/vendors", vendorRoutes);
// 6/7/15/18: Expense + Receipt + AI hooks + Search&Filters (same resource)
app.use("/api/expenses", expRoutes);
// 9. Budget Management
app.use("/api/budgets", budgetRoutes);
// 10. Approval Workflow
app.use("/api/approvals", approvalRoutes);
// 11. Reimbursement Management
app.use("/api/reimbursements", reimbursementRoutes);
// 13. Payment Management
app.use("/api/payments", paymentRoutes);
// 14. Notification Center
app.use("/api/notifications", notificationRoutes);
// 19/20. Audit Logs + Activity Timeline
app.use("/api/audit-logs", auditRoutes);
// 15/16/23. AI Assistant + Analytics Dashboard
app.use("/api/analytics", analyticsRoutes);
// 17. Reports
app.use("/api/reports", reportRoutes);
// 21/22. Subscription Management + Billing & Invoices
app.use("/api/subscriptions", subscriptionRoutes);
// Super Admin Panel (platform-wide, Section 6 of the doc)
app.use("/api/super-admin", superAdminRoutes);

// Serve local profile image uploads in development
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}
// Generated report files (PDF/Excel/CSV) — Module 17
app.use("/reports", express.static(path.join(__dirname, "reports")));

// ─── Swagger Docs ─────────────────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Database + Server ────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // Real-time notifications (Socket.io) — Module 14
    initSocket(httpServer);

    // Background jobs (BullMQ over Redis) — OCR, email, reports
    // Set DISABLE_WORKERS=true to run the API without Redis available (e.g. quick local smoke tests).
    if (process.env.DISABLE_WORKERS !== "true") {
      try {
        startWorkers();
      } catch (err) {
        console.error("⚠️  Background workers failed to start (is Redis running?):", err.message);
      }
    }

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
