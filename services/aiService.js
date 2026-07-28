import Exp from "../models/Exp.js";
import Organization from "../models/Organization.js";

/**
 * AI Assistant (doc module 15). Kept intentionally rule-based/lightweight
 * per the doc's own advice: "Keep AI features simple but real ... don't
 * over-engineer this for a portfolio project." Each function is a clean
 * seam to swap in a real LLM/ML call later without touching callers.
 */

// ─── Policy validation — org.settings.policyRules ──────────────────────────
export const checkPolicyViolations = async (expense) => {
  const org = await Organization.findById(expense.organizationId).select("settings");
  const rules = org?.settings?.policyRules || {};
  const flags = [];

  if (rules.maxExpenseAmount && expense.amount > rules.maxExpenseAmount) flags.push("OVER_POLICY_LIMIT");
  if (rules.requireReceiptAboveAmount != null && expense.amount > rules.requireReceiptAboveAmount && (!expense.receiptIds || expense.receiptIds.length === 0)) {
    flags.push("MISSING_RECEIPT");
  }
  if (rules.blockFutureDatedExpenses && new Date(expense.expenseDate) > new Date()) flags.push("FUTURE_DATED");
  if (rules.maxExpenseAgeDays) {
    const ageDays = (Date.now() - new Date(expense.expenseDate).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays > rules.maxExpenseAgeDays) flags.push("EXPENSE_TOO_OLD");
  }

  return flags;
};

// ─── Duplicate detection ────────────────────────────────────────────────────
// Flags an expense as a likely duplicate if the same employee has another
// expense with the same amount + vendor within a 3-day window.
export const detectDuplicate = async (expense) => {
  if (!expense.vendorId) return false;
  const windowStart = new Date(expense.expenseDate);
  windowStart.setDate(windowStart.getDate() - 3);
  const windowEnd = new Date(expense.expenseDate);
  windowEnd.setDate(windowEnd.getDate() + 3);

  const dup = await Exp.findOne({
    _id: { $ne: expense._id },
    organizationId: expense.organizationId,
    employeeId: expense.employeeId,
    vendorId: expense.vendorId,
    amount: expense.amount,
    expenseDate: { $gte: windowStart, $lte: windowEnd },
  });
  return Boolean(dup);
};

// Simple keyword → category confidence map used as a placeholder
// auto-categorizer when a real classifier isn't wired up.
const KEYWORD_HINTS = {
  travel: ["flight", "uber", "taxi", "airfare", "hotel", "train"],
  food: ["restaurant", "lunch", "dinner", "coffee", "meal"],
  software: ["saas", "subscription", "license", "software"],
  office: ["stationery", "supplies", "office"],
};

export const autoCategorizeAndFlag = async (expense) => {
  const text = `${expense.title} ${expense.description || ""}`.toLowerCase();
  let confidence = 0.5;
  for (const keywords of Object.values(KEYWORD_HINTS)) {
    if (keywords.some((k) => text.includes(k))) {
      confidence = 0.85;
      break;
    }
  }

  const isDuplicate = await detectDuplicate(expense);

  expense.aiCategoryConfidence = confidence;
  expense.isDuplicateFlag = isDuplicate;
  await expense.save();
  return expense;
};

/**
 * Stub Q&A endpoint backing an "AI Assistant chat" UI — e.g. "how much did
 * I spend on travel last month?". Real implementation would call an LLM API
 * with retrieved expense/budget context (RAG-style); this returns a
 * deterministic canned response so the endpoint is demoable without an API key.
 */
export const answerAssistantQuery = async (organizationId, userId, question) => {
  if (!process.env.OPENAI_API_KEY) {
    return {
      answer: "AI Assistant Q&A is not configured — set OPENAI_API_KEY to enable live LLM answers.",
      question,
    };
  }
  // TODO: call the LLM provider here with expense/budget context for `organizationId`/`userId`.
  return { answer: "LLM integration point — wire your provider call here.", question };
};

/** Basic spend forecast — naive average of the last 3 months, no ML dependency required. */
export const forecastNextMonthSpend = async (organizationId, employeeId = null) => {
  const match = { organizationId, status: { $in: ["approved", "reimbursed"] } };
  if (employeeId) match.employeeId = employeeId;

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  match.expenseDate = { $gte: threeMonthsAgo };

  const rows = await Exp.aggregate([
    { $match: match },
    { $group: { _id: { $month: "$expenseDate" }, total: { $sum: "$amount" } } },
  ]);
  if (rows.length === 0) return { forecast: 0, basis: "no historical data" };
  const avg = rows.reduce((sum, r) => sum + r.total, 0) / rows.length;
  return { forecast: Math.round(avg * 100) / 100, basis: `average of last ${rows.length} month(s)` };
};
