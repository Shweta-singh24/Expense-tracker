// ─── Central enums / constants shared across the whole backend ────────────────
// Keeping these in one file avoids typo'd string literals scattered everywhere.

export const ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  ORG_ADMIN: "org_admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
});
export const ALL_ROLES = Object.values(ROLES);

export const USER_STATUS = Object.freeze({
  ACTIVE: "active",
  SUSPENDED: "suspended",
  INVITED: "invited",
});

export const ORG_STATUS = Object.freeze({
  ACTIVE: "active",
  SUSPENDED: "suspended",
  TRIAL: "trial",
});

export const EXPENSE_STATUS = Object.freeze({
  DRAFT: "draft",
  SUBMITTED: "submitted",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  REJECTED: "rejected",
  REIMBURSED: "reimbursed",
});

export const APPROVAL_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
});

export const REIMBURSEMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  PAID: "paid",
  FAILED: "failed",
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
});

export const PAYMENT_METHOD = Object.freeze({
  BANK_TRANSFER: "bank_transfer",
  PAYROLL: "payroll",
  WALLET: "wallet",
  CASH: "cash",
});

export const BUDGET_SCOPE = Object.freeze({
  DEPARTMENT: "department",
  BRANCH: "branch",
  PROJECT: "project",
  ORG: "org",
});

export const BUDGET_PERIOD = Object.freeze({
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  YEARLY: "yearly",
});

export const NOTIFICATION_TYPE = Object.freeze({
  EXPENSE_SUBMITTED: "expense_submitted",
  EXPENSE_APPROVED: "expense_approved",
  EXPENSE_REJECTED: "expense_rejected",
  APPROVAL_REQUIRED: "approval_required",
  REIMBURSEMENT_PAID: "reimbursement_paid",
  BUDGET_ALERT: "budget_alert",
  INVOICE_ISSUED: "invoice_issued",
  ACCOUNT: "account",
  GENERAL: "general",
});

export const INVOICE_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
});

// Default org.settings.approvalLevels shape used when an org has not configured
// a custom workflow yet. Each level resolves to an approver at runtime via
// approvalService.resolveApprover().
export const DEFAULT_APPROVAL_LEVELS = [
  { level: 1, approverRole: "manager", autoApproveUnderAmount: 0 },
];

export const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB) || 10;
