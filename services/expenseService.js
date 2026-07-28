import mongoose from "mongoose";
import Exp from "../models/Exp.js";
import Category from "../models/Category.js";
import { checkPolicyViolations, autoCategorizeAndFlag } from "./aiService.js";
import { initiateApproval } from "./approvalService.js";
import { incrementVendorSpend } from "./vendorService.js";
import { applySpendToBudget } from "./budgetService.js";

export const createExpenseService = async (organizationId, employeeId, body) => {
  const { title, description, amount, currency, categoryId, vendorId, expenseDate, departmentId, branchId, notes } = body;

  const category = await Category.findOne({ _id: categoryId, $or: [{ organizationId: null }, { organizationId }] });
  if (!category) throw { status: 404, message: "Category not found" };

  const expense = await Exp.create({
    organizationId,
    employeeId,
    departmentId: departmentId || null,
    branchId: branchId || null,
    title,
    description: description || null,
    amount,
    currency: currency || "USD",
    categoryId,
    vendorId: vendorId || null,
    expenseDate: expenseDate || Date.now(),
    notes: notes || null,
    status: "draft",
  });

  // AI Assistant (module 15) runs before the expense is ever submitted for approval.
  await autoCategorizeAndFlag(expense);

  return Exp.findById(expense._id);
};

export const listExpensesService = async (req, filters = {}) => {
  const { organizationId, user } = req;
  const query = { organizationId };

  // Role-scoped visibility: employees see only their own, managers see their
  // department, org_admin/super_admin see everything in scope.
  if (user.role === "employee") query.employeeId = user._id;
  if (user.role === "manager" && user.departmentId) query.departmentId = user.departmentId;

  if (filters.status) query.status = filters.status;
  if (filters.categoryId) query.categoryId = filters.categoryId;
  if (filters.employeeId && user.role !== "employee") query.employeeId = filters.employeeId;
  if (filters.departmentId && user.role !== "employee") query.departmentId = filters.departmentId;
  if (filters.startDate || filters.endDate) {
    query.expenseDate = {};
    if (filters.startDate) query.expenseDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.expenseDate.$lte = new Date(filters.endDate);
  }
  if (filters.search) query.$text = { $search: filters.search };

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;

  const [items, total] = await Promise.all([
    Exp.find(query)
      .populate("employeeId", "name email")
      .populate("categoryId", "name icon")
      .populate("vendorId", "name")
      .sort({ expenseDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Exp.countDocuments(query),
  ]);

  return { items, total, page, limit };
};

export const getExpenseService = async (organizationId, id) => {
  const expense = await Exp.findOne({ _id: id, organizationId })
    .populate("employeeId", "name email departmentId")
    .populate("categoryId", "name icon")
    .populate("vendorId", "name")
    .populate("receiptIds");
  if (!expense) throw { status: 404, message: "Expense not found" };
  return expense;
};

export const updateExpenseService = async (organizationId, id, employeeId, updates) => {
  const expense = await Exp.findOne({ _id: id, organizationId, employeeId });
  if (!expense) throw { status: 404, message: "Expense not found" };
  if (!["draft", "rejected"].includes(expense.status)) {
    throw { status: 400, message: `Cannot edit an expense with status "${expense.status}"` };
  }
  Object.assign(expense, updates);
  await expense.save();
  return expense;
};

export const deleteExpenseService = async (organizationId, id, employeeId) => {
  const expense = await Exp.findOne({ _id: id, organizationId, employeeId });
  if (!expense) throw { status: 404, message: "Expense not found" };
  if (!["draft", "rejected"].includes(expense.status)) {
    throw { status: 400, message: `Cannot delete an expense with status "${expense.status}"` };
  }
  await expense.deleteOne();
  return expense;
};

/**
 * Submit for approval — runs policy validation, then hands off to the
 * Approval Workflow module. This is the transition the doc's core flow
 * diagram calls out: "AI auto-categorizes + checks duplicates + policy
 * validation → Expense enters Approval Workflow".
 */
export const submitExpenseService = async (organizationId, id, employeeId) => {
  const expense = await Exp.findOne({ _id: id, organizationId, employeeId });
  if (!expense) throw { status: 404, message: "Expense not found" };
  if (!["draft", "rejected"].includes(expense.status)) {
    throw { status: 400, message: `Expense is already in "${expense.status}" status` };
  }

  const violations = await checkPolicyViolations(expense);
  expense.policyViolationFlags = violations;
  expense.status = "submitted";
  expense.submittedAt = new Date();
  await expense.save();

  // Kicks off approvals.js records + notifies the first-level approver.
  await initiateApproval(expense);

  expense.status = "pending_approval";
  await expense.save();

  return expense;
};

/**
 * Called by approvalService once the final configured approval level signs
 * off. Applies budget consumption and vendor spend analytics, per the doc's
 * module interconnection rules.
 */
export const markExpenseApproved = async (expenseId) => {
  const expense = await Exp.findById(expenseId);
  if (!expense) return null;
  expense.status = "approved";
  expense.approvedAt = new Date();
  await expense.save();

  const { createReimbursementForExpense } = await import("./reimbursementService.js");

  await Promise.all([
    applySpendToBudget(expense.organizationId, expense),
    incrementVendorSpend(expense.organizationId, expense.vendorId, expense.amount),
    createReimbursementForExpense(expense),
  ]);

  return expense;
};

export const markExpenseRejected = async (expenseId, reason) => {
  const expense = await Exp.findById(expenseId);
  if (!expense) return null;
  expense.status = "rejected";
  expense.rejectedAt = new Date();
  expense.rejectionReason = reason || null;
  await expense.save();
  return expense;
};

export const markExpenseReimbursed = async (expenseId) => {
  return Exp.findByIdAndUpdate(expenseId, { status: "reimbursed" }, { new: true });
};

// Kept for backward compatibility with the original monthly report endpoint.
export const monthlyReportService = async (organizationId, employeeId, month, year) => {
  const start = new Date(`${year}-${month}-01`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);

  return Exp.aggregate([
    {
      $match: {
        organizationId: new mongoose.Types.ObjectId(organizationId),
        employeeId: new mongoose.Types.ObjectId(employeeId),
        expenseDate: { $gte: start, $lt: end },
      },
    },
    { $group: { _id: "$categoryId", totalSpent: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
};
