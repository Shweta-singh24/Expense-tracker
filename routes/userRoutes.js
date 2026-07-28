import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { subscriptionGate } from "../middleware/subscriptionGate.js";
import { audit } from "../services/auditService.js";
import { inviteUserValidation, setUserStatusValidation } from "../validators/userValidators.js";
import { inviteUser, getUsers, getUser, updateUser, setUserStatus, deleteUser } from "../controllers/userController.js";

const router = express.Router();
router.use(protect);

// Module 3: User Management — Org Admin scoped CRUD over employees/managers.
router.post("/invite", authorize("org_admin"), subscriptionGate("user"), inviteUserValidation, audit("user.invite", "User"), inviteUser);
router.get("/", authorize("org_admin", "manager"), getUsers);
router.get("/:id", authorize("org_admin", "manager"), getUser);
router.put("/:id", authorize("org_admin"), audit("user.update", "User"), updateUser);
router.put("/:id/status", authorize("org_admin"), setUserStatusValidation, audit("user.status_change", "User"), setUserStatus);
router.delete("/:id", authorize("org_admin"), audit("user.delete", "User"), deleteUser);

export default router;
