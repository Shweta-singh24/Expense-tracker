import { body } from "express-validator";

export const registerValidation = [
  // Organization fields
  body("orgName").trim().notEmpty().withMessage("Organization name is required"),
  body("orgEmail").isEmail().normalizeEmail().withMessage("Valid organization email is required"),
  body("orgPhone").trim().notEmpty().withMessage("Organization phone is required"),

  // Admin fields
  body("adminName").trim().notEmpty().withMessage("Admin name is required"),
  body("adminEmail").isEmail().normalizeEmail().withMessage("Valid admin email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and a number"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match");
    return true;
  }),
  body("acceptTerms")
    .equals("true")
    .withMessage("You must accept the terms and conditions"),
];

export const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
];

export const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and a number"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error("Passwords do not match");
    return true;
  }),
];
