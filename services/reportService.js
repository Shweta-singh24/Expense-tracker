import { reportQueue, defaultJobOptions } from "../config/queue.js";

/**
 * Report generation (doc module 17: PDF/Excel/CSV for expenses, budgets,
 * reimbursements, audits) is queued as a background job — per the doc's
 * async architecture rule — and the requester is notified when it's ready.
 */
export const requestReportService = async ({ organizationId, requestedBy, reportType, format, filters }) => {
  if (!["expenses", "budgets", "reimbursements", "audit"].includes(reportType)) {
    throw { status: 400, message: "Invalid reportType" };
  }
  if (!["pdf", "excel", "csv"].includes(format)) {
    throw { status: 400, message: "Invalid format — use pdf, excel, or csv" };
  }

  const job = await reportQueue.add(
    "generate",
    { organizationId, requestedBy, reportType, format, filters: filters || {} },
    defaultJobOptions
  );

  return { jobId: job.id, status: "queued" };
};
