import { body } from "express-validator";

export const createVendorValidation = [
  body("name").trim().notEmpty().withMessage("Vendor name is required").isLength({ max: 150 }),
  body("category").optional().trim(),
  body("contactInfo.email").optional().isEmail(),
  body("contactInfo.phone").optional().trim(),
];
export const updateVendorValidation = [
  body("name").optional().trim().isLength({ min: 1, max: 150 }),
  body("category").optional().trim(),
  body("isActive").optional().isBoolean(),
];
