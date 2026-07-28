import Approval from "../models/Approval.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Exp from "../models/Exp.js";
import { createNotification } from "./notificationService.js";
import { logAudit } from "./auditService.js";

/**
 * Resolves the concrete approver User for a given level config, expense,
 * and org. "manager" resolves to the employee's direct manager; "org_admin"
 * resolves to any active org_admin in the org (first found — a real system
 * might round-robin or use a designated approver field).
 */
const resolveApprover = async (levelConfig, expense) => {
  if (levelConfig.approverRole === "manager") {
    const employee = await User.findById(expense.employeeId);
    if (employee?.managerId) return employee.managerId;
    // Fall back to department manager if the employee has no direct managerId set.
    if (expense.departmentId) {
      const Department = (await import("../models/Department.js")).default;
      const dept = await Department.findById(expense.departmentId);
      if (dept?.managerId) return dept.managerId;
    }
    return null;
  }
  if (levelConfig.approverRole === "org_admin") {
    const admin = await User.findOne({ organizationId: expense.organizationId, role: "org_admin", status: "active" });
    return admin?._id || null;
  }
  return null;
};

/**
 * Creates the first-level Approval record for a freshly submitted expense
 * and notifies that approver. Config-driven off
 * organization.settings.approvalLevels (doc: "should be config-driven, not
 * hardcoded — lets you demo configurable business logic").
 */
export const initiateApproval = async (expense) => {
  const org = await Organization.findById(expense.organizationId);
  const levels = (org?.settings?.approvalLevels || []).sort((a, b) => a.level - b.level);
  if (levels.length === 0) throw { status: 400, message: "Organization has no approval workflow configured" };

  expense.currentApprovalLevel = levels[0].level;
  await expense.save();

  await createApprovalForLevel(expense, levels[0]);
};

const createApprovalForLevel = async (expense, levelConfig) => {
  // Auto-approve this level if under the configured threshold — still logs
  // an approved Approval record for a complete audit trail.
  if (levelConfig.autoApproveUnderAmount && expense.amount <= levelConfig.autoApproveUnderAmount) {
    await Approval.create({
      organizationId: expense.organizationId,
      expenseId: expense._id,
      level: levelConfig.level,
      approverId: expense.employeeId, // system auto-approval, attributed for traceability
      status: "approved",
      comment: "Auto-approved: under threshold",
      actionedAt: new Date(),
    });
    return advanceWorkflow(expense);
  }

  const approverId = await resolveApprover(levelConfig, expense);
  if (!approverId) throw { status: 400, message: `No approver could be resolved for level ${levelConfig.level}` };

  await Approval.create({
    organizationId: expense.organizationId,
    expenseId: expense._id,
    level: levelConfig.level,
    approverId,
    status: "pending",
  });

  await createNotification({
    organizationId: expense.organizationId,
    userId: approverId,
    type: "approval_required",
    title: "Expense awaiting your approval",
    message: `Expense "${expense.title}" (${expense.currency} ${expense.amount}) needs your approval.`,
    relatedEntityId: expense._id,
  });
};

/** After a level is approved, either move to the next level or finalize. */
const advanceWorkflow = async (expenseDoc) => {
  const { markExpenseApproved } = await import("./expenseService.js");
  const org = await Organization.findById(expenseDoc.organizationId);
  const levels = (org?.settings?.approvalLevels || []).sort((a, b) => a.level - b.level);
  const currentIndex = levels.findIndex((l) => l.level === expenseDoc.currentApprovalLevel);
  const nextLevel = levels[currentIndex + 1];

  if (!nextLevel) {
    await markExpenseApproved(expenseDoc._id);
    return;
  }

  expenseDoc.currentApprovalLevel = nextLevel.level;
  await expenseDoc.save();
  await createApprovalForLevel(expenseDoc, nextLevel);
};

/**
 * Approver acts on a pending approval at the expense's current level.
 * Enforces: only the assigned approver may act, and only on the current level.
 */
export const actOnApprovalService = async (organizationId, expenseId, approverId, action, comment) => {
  const expense = await Exp.findOne({ _id: expenseId, organizationId });
  if (!expense) throw { status: 404, message: "Expense not found" };
  if (expense.status !== "pending_approval") throw { status: 400, message: "Expense is not pending approval" };

  const approval = await Approval.findOne({
    organizationId,
    expenseId,
    level: expense.currentApprovalLevel,
    approverId,
    status: "pending",
  });
  if (!approval) throw { status: 403, message: "You are not the assigned approver for this expense at its current level" };

  approval.status = action === "approve" ? "approved" : "rejected";
  approval.comment = comment || null;
  approval.actionedAt = new Date();
  await approval.save();

  await logAudit({
    organizationId,
    actorId: approverId,
    action: `expense.${action}`,
    targetType: "Expense",
    targetId: expenseId,
    metadata: { level: expense.currentApprovalLevel, comment },
  });

  if (action === "reject") {
    const { markExpenseRejected } = await import("./expenseService.js");
    await markExpenseRejected(expenseId, comment);
    await createNotification({
      organizationId,
      userId: expense.employeeId,
      type: "expense_rejected",
      title: "Expense rejected",
      message: `Your expense "${expense.title}" was rejected${comment ? `: ${comment}` : "."}`,
      relatedEntityId: expenseId,
    });
    return expense;
  }

  await advanceWorkflow(expense);
  const refreshed = await Exp.findById(expenseId);
  if (refreshed.status === "approved") {
    await createNotification({
      organizationId,
      userId: expense.employeeId,
      type: "expense_approved",
      title: "Expense approved",
      message: `Your expense "${expense.title}" was fully approved.`,
      relatedEntityId: expenseId,
    });
  }
  return refreshed;
};

export const listMyPendingApprovalsService = async (organizationId, approverId) =>
  Approval.find({ organizationId, approverId, status: "pending" })
    .populate({ path: "expenseId", populate: [{ path: "employeeId", select: "name email" }, { path: "categoryId", select: "name" }] })
    .sort({ createdAt: -1 });

export const listApprovalHistoryForExpense = async (organizationId, expenseId) =>
  Approval.find({ organizationId, expenseId }).populate("approverId", "name email role").sort({ level: 1 });
