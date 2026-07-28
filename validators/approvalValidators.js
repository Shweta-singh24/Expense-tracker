import { body } from "express-validator";

export const actOnApprovalValidation = [
  body("action").isIn(["approve", "reject"]).withMessage("action must be 'approve' or 'reject'"),
  body("comment").optional().trim().isLength({ max: 500 }),
];
