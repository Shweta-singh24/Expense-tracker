import { body } from "express-validator";

export const createBranchValidation = [
  body("name").trim().notEmpty().withMessage("Branch name is required").isLength({ max: 100 }),
  body("location").optional().trim().isLength({ max: 200 }),
  body("allocatedBudget").optional().isFloat({ min: 0 }),
];

export const updateBranchValidation = [
  body("name").optional().trim().isLength({ min: 1, max: 100 }),
  body("location").optional().trim().isLength({ max: 200 }),
  body("allocatedBudget").optional().isFloat({ min: 0 }),
  body("isActive").optional().isBoolean(),
];
