import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getPayments, getPayment } from "../controllers/paymentController.js";

const router = express.Router();
router.use(protect, authorize("org_admin", "manager"));

router.get("/", getPayments);
router.get("/:id", getPayment);

export default router;
