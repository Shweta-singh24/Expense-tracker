import { body } from "express-validator";

export const processReimbursementValidation = [
  body("method").optional().isIn(["bank_transfer", "payroll", "wallet", "cash"]),
];
