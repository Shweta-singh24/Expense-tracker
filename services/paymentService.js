import Payment from "../models/Payment.js";

/**
 * Records a payment attempt against a reimbursement. No real payment
 * gateway is wired (per the app's safety rules, this backend must never
 * execute a real money transfer) — this simulates gateway settlement so the
 * reimbursement → payment → status pipeline is fully demoable end to end.
 * Swap `simulateGatewaySettlement` for a real provider call (Stripe, Razorpay,
 * ACH) behind the same interface.
 */
const simulateGatewaySettlement = async () => ({ success: true, transactionRef: `SIM-${Date.now()}` });

export const createPaymentService = async (organizationId, reimbursementId, amount, method = "bank_transfer") => {
  const payment = await Payment.create({ organizationId, reimbursementId, method, amount, status: "pending" });

  const result = await simulateGatewaySettlement();
  payment.status = result.success ? "success" : "failed";
  payment.transactionRef = result.transactionRef;
  payment.paidAt = result.success ? new Date() : null;
  await payment.save();

  return payment;
};

export const listPaymentsService = async (organizationId, filters = {}) => {
  const query = { organizationId };
  if (filters.reimbursementId) query.reimbursementId = filters.reimbursementId;
  if (filters.status) query.status = filters.status;
  return Payment.find(query).sort({ createdAt: -1 });
};

export const getPaymentService = async (organizationId, id) => {
  const payment = await Payment.findOne({ _id: id, organizationId });
  if (!payment) throw { status: 404, message: "Payment not found" };
  return payment;
};
