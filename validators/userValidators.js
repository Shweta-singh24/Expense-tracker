import { body } from "express-validator";

export const inviteUserValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 3, max: 100 }),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("role").optional().isIn(["org_admin", "manager", "employee"]),
  body("departmentId").optional().isMongoId(),
  body("branchId").optional().isMongoId(),
  body("managerId").optional().isMongoId(),
];

export const setUserStatusValidation = [body("status").isIn(["active", "suspended", "invited"]).withMessage("Invalid status")];
