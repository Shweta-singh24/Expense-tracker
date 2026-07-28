import express from "express";
import { protect, requireSuperAdmin } from "../middleware/authMiddleware.js";
import { audit } from "../services/auditService.js";
import {
  getOrganizations,
  setOrganizationStatus,
  getOrganizationUsage,
  getAllUsers,
  setAnyUserStatus,
  getSecurityOverview,
  getSystemSettings,
  updateSystemSettings,
  createPlatformCategory,
} from "../controllers/superAdminController.js";

const router = express.Router();
router.use(protect, requireSuperAdmin);

// 6.3 Organization Management (platform-wide)
router.get("/organizations", getOrganizations);
router.put("/organizations/:id/status", audit("org.status_change", "Organization"), setOrganizationStatus);
router.get("/organizations/:id/usage", getOrganizationUsage);

// 6.2 User Management (platform-wide)
router.get("/users", getAllUsers);
router.put("/users/:id/status", audit("user.status_change_platform", "User"), setAnyUserStatus);

// 6.8 Security Center
router.get("/security", getSecurityOverview);

// 6.11 System Settings
router.get("/settings", getSystemSettings);
router.put("/settings", audit("system.settings_update", "SystemSettings"), updateSystemSettings);

// 6.5 Category Management (platform defaults)
router.post("/categories", audit("category.platform_create", "Category"), createPlatformCategory);

export default router;
