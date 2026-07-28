import { body } from "express-validator";

export const createExpenseValidation = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 150 }),
  body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be greater than 0"),
  body("categoryId").isMongoId().withMessage("Valid categoryId is required"),
  body("vendorId").optional().isMongoId(),
  body("departmentId").optional().isMongoId(),
  body("branchId").optional().isMongoId(),
  body("expenseDate").optional().isISO8601().withMessage("expenseDate must be a valid date"),
  body("currency").optional().isLength({ min: 3, max: 3 }),
];

export const updateExpenseValidation = [
  body("title").optional().trim().isLength({ min: 1, max: 150 }),
  body("amount").optional().isFloat({ min: 0.01 }),
  body("categoryId").optional().isMongoId(),
  body("vendorId").optional().isMongoId(),
  body("expenseDate").optional().isISO8601(),
];
