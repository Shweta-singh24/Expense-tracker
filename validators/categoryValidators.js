import { body } from "express-validator";

export const createCategoryValidation = [
  body("name").trim().notEmpty().withMessage("Category name is required").isLength({ max: 100 }),
  body("icon").optional().trim(),
];
export const updateCategoryValidation = [
  body("name").optional().trim().isLength({ min: 1, max: 100 }),
  body("icon").optional().trim(),
  body("isActive").optional().isBoolean(),
];
