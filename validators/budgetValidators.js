import { body } from "express-validator";

export const createBudgetValidation = [
  body("scope").isIn(["department", "branch", "project", "org"]).withMessage("Invalid scope"),
  body("scopeRefId").optional().isMongoId(),
  body("period").isIn(["monthly", "quarterly", "yearly"]).withMessage("Invalid period"),
  body("startDate").isISO8601().withMessage("startDate must be a valid date"),
  body("endDate").isISO8601().withMessage("endDate must be a valid date"),
  body("allocatedAmount").isFloat({ min: 0 }).withMessage("allocatedAmount must be a positive number"),
  body("alertThresholdPercent").optional().isInt({ min: 1, max: 100 }),
];
export const updateBudgetValidation = [
  body("allocatedAmount").optional().isFloat({ min: 0 }),
  body("alertThresholdPercent").optional().isInt({ min: 1, max: 100 }),
  body("isActive").optional().isBoolean(),
];
