import mongoose from "mongoose";
import Exp from "../models/Exp.js";
import Budget from "../models/Budget.js";

const oid = (id) => new mongoose.Types.ObjectId(id);

/**
 * Role-scoped analytics dashboard aggregator (doc module 16). Employees see
 * their own numbers, managers see their department, org_admin/super_admin
 * see the whole org — enforced by the `scopeMatch` the caller builds from
 * req.user, mirroring the same rule used in expenseService.listExpensesService.
 */
export const getDashboardAnalytics = async (organizationId, scopeMatch = {}) => {
  const baseMatch = { organizationId: oid(organizationId), ...scopeMatch };

  const [totals, categoryBreakdown, statusBreakdown, monthlyTrend, budgets] = await Promise.all([
    Exp.aggregate([
      { $match: baseMatch },
      { $group: { _id: null, totalAmount: { $sum: "$amount" }, count: { $sum: 1 }, avgAmount: { $avg: "$amount" } } },
    ]),
    Exp.aggregate([
      { $match: { ...baseMatch, status: { $in: ["approved", "reimbursed"] } } },
      { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
      { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $project: { categoryName: "$category.name", total: 1 } },
      { $sort: { total: -1 } },
    ]),
    Exp.aggregate([{ $match: baseMatch }, { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } }]),
    Exp.aggregate([
      { $match: { ...baseMatch, expenseDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) } } },
      { $group: { _id: { year: { $year: "$expenseDate" }, month: { $month: "$expenseDate" } }, total: { $sum: "$amount" } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Budget.find({ organizationId, isActive: true }).select("scope scopeRefId allocatedAmount spentAmount"),
  ]);

  return {
    totalAmount: totals[0]?.totalAmount || 0,
    totalCount: totals[0]?.count || 0,
    avgAmount: Math.round((totals[0]?.avgAmount || 0) * 100) / 100,
    categoryBreakdown,
    statusBreakdown,
    monthlyTrend,
    budgetUtilization: budgets.map((b) => ({
      id: b._id,
      scope: b.scope,
      allocatedAmount: b.allocatedAmount,
      spentAmount: b.spentAmount,
      utilizationPercent: b.allocatedAmount > 0 ? Math.round((b.spentAmount / b.allocatedAmount) * 100) : 0,
    })),
  };
};

/** Super Admin platform-wide analytics (doc section 6.9). */
export const getPlatformAnalytics = async () => {
  const Organization = (await import("../models/Organization.js")).default;
  const User = (await import("../models/User.js")).default;

  const [orgCount, userCount, activeOrgs, expenseVolume] = await Promise.all([
    Organization.countDocuments(),
    User.countDocuments(),
    Organization.countDocuments({ status: "active" }),
    Exp.aggregate([{ $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
  ]);

  return {
    totalOrganizations: orgCount,
    activeOrganizations: activeOrgs,
    totalUsers: userCount,
    totalExpenseVolume: expenseVolume[0]?.total || 0,
    totalExpenseCount: expenseVolume[0]?.count || 0,
  };
};

/** Builds the role-scoped match object from the requesting user — shared with expenseService's scoping rules. */
export const buildScopeMatch = (user) => {
  if (user.role === "employee") return { employeeId: oid(user._id) };
  if (user.role === "manager" && user.departmentId) return { departmentId: oid(user.departmentId) };
  return {}; // org_admin / super_admin see everything in the organizationId already applied
};
