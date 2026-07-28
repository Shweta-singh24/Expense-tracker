import Reimbursement from "../models/Reimbursement.js";
import Exp from "../models/Exp.js";
import { createPaymentService } from "./paymentService.js";
import { markExpenseReimbursed } from "./expenseService.js";
import { createNotification } from "./notificationService.js";

/**
 * Creates a Reimbursement record for a newly-approved expense. Called from
 * approvalService/expenseService once an expense reaches "approved" —
 * enforces the doc's ordering rule: "Nothing pays out money directly —
 * always Expense -> Approval -> Reimbursement -> Payment."
 */
export const createReimbursementForExpense = async (expense) => {
  const existing = await Reimbursement.findOne({ expenseId: expense._id });
  if (existing) return existing;

  return Reimbursement.create({
    organizationId: expense.organizationId,
    expenseId: expense._id,
    employeeId: expense.employeeId,
    amount: expense.amount,
    currency: expense.currency,
    status: "pending",
  });
};

export const listReimbursementsService = async (organizationId, req, filters = {}) => {
  const query = { organizationId };
  if (req.user.role === "employee") query.employeeId = req.user._id;
  if (filters.status) query.status = filters.status;
  return Reimbursement.find(query).populate("expenseId", "title amount currency").populate("employeeId", "name email").sort({ requestedAt: -1 });
};

export const getReimbursementService = async (organizationId, id) => {
  const r = await Reimbursement.findOne({ _id: id, organizationId }).populate("expenseId").populate("employeeId", "name email");
  if (!r) throw { status: 404, message: "Reimbursement not found" };
  return r;
};

/** Finance/Org Admin triggers payout — moves pending -> processing -> paid/failed. */
export const processReimbursementService = async (organizationId, id, method) => {
  const reimbursement = await Reimbursement.findOne({ _id: id, organizationId });
  if (!reimbursement) throw { status: 404, message: "Reimbursement not found" };
  if (reimbursement.status !== "pending") throw { status: 400, message: `Reimbursement is already "${reimbursement.status}"` };

  reimbursement.status = "processing";
  await reimbursement.save();

  const payment = await createPaymentService(organizationId, reimbursement._id, reimbursement.amount, method);

  reimbursement.paymentId = payment._id;
  reimbursement.status = payment.status === "success" ? "paid" : "failed";
  reimbursement.paidAt = payment.status === "success" ? new Date() : null;
  await reimbursement.save();

  if (reimbursement.status === "paid") {
    await markExpenseReimbursed(reimbursement.expenseId);
    await createNotification({
      organizationId,
      userId: reimbursement.employeeId,
      type: "reimbursement_paid",
      title: "Reimbursement paid",
      message: `Your reimbursement of ${reimbursement.currency} ${reimbursement.amount} has been paid.`,
      relatedEntityId: reimbursement._id,
    });
  }

  return reimbursement;
};
