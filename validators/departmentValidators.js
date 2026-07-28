import { body } from "express-validator";

export const createDepartmentValidation = [
  body("name").trim().notEmpty().withMessage("Department name is required").isLength({ max: 100 }),
  body("managerId").optional().isMongoId().withMessage("managerId must be a valid id"),
  body("branchId").optional().isMongoId().withMessage("branchId must be a valid id"),
  body("allocatedBudget").optional().isFloat({ min: 0 }).withMessage("allocatedBudget must be a positive number"),
];

export const updateDepartmentValidation = [
  body("name").optional().trim().isLength({ min: 1, max: 100 }),
  body("managerId").optional().isMongoId(),
  body("branchId").optional().isMongoId(),
  body("allocatedBudget").optional().isFloat({ min: 0 }),
  body("isActive").optional().isBoolean(),
];
