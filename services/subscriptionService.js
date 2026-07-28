import SubscriptionPlan from "../models/SubscriptionPlan.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Invoice from "../models/Invoice.js";

// ─── Plan CRUD — Super Admin only (doc 6.4) ─────────────────────────────────
export const createPlanService = async (body) => SubscriptionPlan.create(body);
export const listPlansService = async () => SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
export const updatePlanService = async (id, updates) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!plan) throw { status: 404, message: "Plan not found" };
  return plan;
};

// Super Admin manually assigns/changes an org's plan (doc 6.4).
export const assignPlanToOrgService = async (organizationId, planId) => {
  const [org, plan] = await Promise.all([Organization.findById(organizationId), SubscriptionPlan.findById(planId)]);
  if (!org) throw { status: 404, message: "Organization not found" };
  if (!plan) throw { status: 404, message: "Plan not found" };
  org.subscriptionPlanId = plan._id;
  await org.save();

  await Invoice.create({
    organizationId,
    planId,
    amount: plan.price,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return org;
};

/**
 * Plan-limit gate — checked before actions that consume metered resources
 * (adding a user, uploading a receipt, calling the AI assistant). Doc:
 * "gates: max users, storage limit, AI credit limit — enforced at
 * Organization level, checked before allowing certain actions."
 */
export const enforcePlanLimit = async (organizationId, resource) => {
  const org = await Organization.findById(organizationId).populate("subscriptionPlanId");
  const plan = org?.subscriptionPlanId;
  if (!plan) return; // no plan assigned yet (trial org) — no gating

  if (resource === "user") {
    const userCount = await User.countDocuments({ organizationId });
    if (userCount >= plan.maxUsers) throw { status: 403, message: `User limit reached for the "${plan.name}" plan (${plan.maxUsers} users)` };
  }
  if (resource === "storage") {
    if (org.storageUsedMB / 1024 >= plan.storageLimitGB) throw { status: 403, message: `Storage limit reached for the "${plan.name}" plan` };
  }
  if (resource === "ai") {
    if (org.aiCreditsUsed >= plan.aiCreditLimit) throw { status: 403, message: `AI credit limit reached for the "${plan.name}" plan` };
  }
};

// ─── Invoices ────────────────────────────────────────────────────────────────
export const listInvoicesService = async (organizationId) => Invoice.find({ organizationId }).populate("planId", "name price").sort({ issuedAt: -1 });

export const markInvoicePaidService = async (organizationId, id) => {
  const invoice = await Invoice.findOneAndUpdate({ _id: id, organizationId }, { status: "paid", paidAt: new Date() }, { new: true });
  if (!invoice) throw { status: 404, message: "Invoice not found" };
  return invoice;
};
