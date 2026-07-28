import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { audit } from "../services/auditService.js";
import { createVendorValidation, updateVendorValidation } from "../validators/vendorValidators.js";
import { createVendor, getVendors, getVendor, updateVendor, deleteVendor } from "../controllers/vendorController.js";

const router = express.Router();
router.use(protect);

router.post("/", authorize("org_admin", "manager"), createVendorValidation, audit("vendor.create", "Vendor"), createVendor);
router.get("/", getVendors);
router.get("/:id", getVendor);
router.put("/:id", authorize("org_admin", "manager"), updateVendorValidation, audit("vendor.update", "Vendor"), updateVendor);
router.delete("/:id", authorize("org_admin"), audit("vendor.delete", "Vendor"), deleteVendor);

export default router;
