import express from "express";
import { protect, requireSuperAdmin, authorize } from "../middleware/authMiddleware.js";
import { audit } from "../services/auditService.js";
import { createPlanValidation, assignPlanValidation } from "../validators/subscriptionValidators.js";
import { createPlan, getPlans, updatePlan, assignPlanToOrg, getInvoices, markInvoicePaid } from "../controllers/subscriptionController.js";

const router = express.Router();
router.use(protect);

// Module 21: Subscription Management — plan catalog is Super Admin managed, readable by all.
router.get("/plans", getPlans);
router.post("/plans", requireSuperAdmin, createPlanValidation, audit("plan.create", "SubscriptionPlan"), createPlan);
router.put("/plans/:id", requireSuperAdmin, audit("plan.update", "SubscriptionPlan"), updatePlan);
router.post("/orgs/:orgId/assign-plan", requireSuperAdmin, assignPlanValidation, audit("org.assign_plan", "Organization"), assignPlanToOrg);

// Module 22: Billing & Invoices — org-scoped
router.get("/invoices", authorize("org_admin"), getInvoices);
router.put("/invoices/:id/mark-paid", authorize("org_admin"), audit("invoice.mark_paid", "Invoice"), markInvoicePaid);

export default router;
