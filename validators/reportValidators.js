import { body } from "express-validator";

export const requestReportValidation = [
  body("reportType").isIn(["expenses", "budgets", "reimbursements", "audit"]).withMessage("Invalid reportType"),
  body("format").isIn(["pdf", "excel", "csv"]).withMessage("Invalid format"),
];
