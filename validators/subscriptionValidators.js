import { body } from "express-validator";

export const createPlanValidation = [
  body("name").trim().notEmpty(),
  body("price").isFloat({ min: 0 }),
  body("storageLimitGB").isFloat({ min: 0 }),
  body("aiCreditLimit").isFloat({ min: 0 }),
  body("maxUsers").isInt({ min: 1 }),
];
export const assignPlanValidation = [body("planId").isMongoId().withMessage("Valid planId is required")];
