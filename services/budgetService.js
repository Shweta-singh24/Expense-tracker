import Budget from "../models/Budget.js";
import { createNotification } from "./notificationService.js";
import { emitToOrg } from "../config/socket.js";

export const createBudgetService = async (organizationId, body) => {
  const { scope, scopeRefId, projectName, period, startDate, endDate, allocatedAmount, alertThresholdPercent } = body;
  if (scope !== "org" && scope !== "project" && !scopeRefId) {
    throw { status: 400, message: "scopeRefId is required for department/branch budgets" };
  }
  return Budget.create({
    organizationId,
    scope,
    scopeRefId: scopeRefId || null,
    projectName: projectName || null,
    period,
    startDate,
    endDate,
    allocatedAmount,
    alertThresholdPercent: alertThresholdPercent || 80,
  });
};

export const listBudgetsService = async (organizationId, filters = {}) => {
  const query = { organizationId, isActive: true };
  if (filters.scope) query.scope = filters.scope;
  if (filters.scopeRefId) query.scopeRefId = filters.scopeRefId;
  return Budget.find(query).sort({ startDate: -1 });
};

export const getBudgetService = async (organizationId, id) => {
  const budget = await Budget.findOne({ _id: id, organizationId });
  if (!budget) throw { status: 404, message: "Budget not found" };
  return budget;
};

export const updateBudgetService = async (organizationId, id, updates) => {
  const budget = await Budget.findOneAndUpdate({ _id: id, organizationId }, updates, { new: true, runValidators: true });
  if (!budget) throw { status: 404, message: "Budget not found" };
  return budget;
};

export const deleteBudgetService = async (organizationId, id) => {
  const budget = await Budget.findOneAndDelete({ _id: id, organizationId });
  if (!budget) throw { status: 404, message: "Budget not found" };
  return budget;
};

/**
 * Finds the budget(s) an approved expense falls under (department, branch,
 * and the org-wide catch-all) and increments spentAmount, firing a
 * budget-alert notification if the configured threshold is crossed.
 * Called from expenseService.markExpenseApproved on final approval.
 */
export const applySpendToBudget = async (organizationId, expense) => {
  const candidateFilters = [
    expense.departmentId && { scope: "department", scopeRefId: expense.departmentId },
    expense.branchId && { scope: "branch", scopeRefId: expense.branchId },
    { scope: "org", scopeRefId: null },
  ].filter(Boolean);

  const now = expense.expenseDate || new Date();
  const budgets = await Budget.find({
    organizationId,
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: candidateFilters,
  });

  for (const budget of budgets) {
    const before = budget.spentAmount;
    budget.spentAmount += expense.amount;
    await budget.save();

    const beforePercent = budget.allocatedAmount > 0 ? (before / budget.allocatedAmount) * 100 : 0;
    const afterPercent = budget.allocatedAmount > 0 ? (budget.spentAmount / budget.allocatedAmount) * 100 : 0;

    if (beforePercent < budget.alertThresholdPercent && afterPercent >= budget.alertThresholdPercent) {
      await createNotification({
        organizationId,
        type: "budget_alert",
        title: "Budget threshold reached",
        message: `Budget "${budget.scope}" has reached ${Math.round(afterPercent)}% of its allocated amount.`,
        relatedEntityId: budget._id,
        broadcastToOrg: true,
      });
      emitToOrg(organizationId, "budget:alert", { budgetId: budget._id, utilizationPercent: Math.round(afterPercent) });
    }
  }
};
