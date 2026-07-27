import { body } from "express-validator";

export const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[+]?[\d\s\-().]{7,15}$/)
    .withMessage("Enter a valid phone number"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of birth must be a valid date (YYYY-MM-DD)")
    .custom((value) => {
      if (new Date(value) >= new Date()) throw new Error("Date of birth cannot be a future date");
      return true;
    }),

  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Address cannot exceed 500 characters"),
];

export const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#])/)
    .withMessage("Password must contain uppercase, lowercase, number, and special character"),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error("Passwords do not match");
    return true;
  }),
];
