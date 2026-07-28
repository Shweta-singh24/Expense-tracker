import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { audit } from "../services/auditService.js";
import { getMyOrganization, updateOrganization, updateOrganizationSettings } from "../controllers/organizationController.js";

const router = express.Router();
router.use(protect);

// Module 2: Organization Management — configure org, org-level preferences.
router.get("/me", getMyOrganization);
router.put("/me", authorize("org_admin"), audit("organization.update", "Organization"), updateOrganization);
router.put("/me/settings", authorize("org_admin"), audit("organization.settings_update", "Organization"), updateOrganizationSettings);

export default router;
