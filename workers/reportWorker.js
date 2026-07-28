import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Worker } from "bullmq";
import { Parser as CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { getRedisConnection } from "../config/redis.js";
import Exp from "../models/Exp.js";
import { createNotification } from "../services/notificationService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, "..", "reports");
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const fetchRows = async (organizationId, reportType, filters) => {
  // MVP: expenses report is fully implemented; budgets/reimbursements/audit
  // follow the same pattern (swap the model + projection) and are wired at
  // the queue/route level already — extend here as those datasets grow.
  const query = { organizationId };
  if (filters.status) query.status = filters.status;
  if (filters.startDate || filters.endDate) {
    query.expenseDate = {};
    if (filters.startDate) query.expenseDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.expenseDate.$lte = new Date(filters.endDate);
  }
  const expenses = await Exp.find(query).populate("employeeId", "name email").populate("categoryId", "name").lean();
  return expenses.map((e) => ({
    title: e.title,
    employee: e.employeeId?.name || "",
    category: e.categoryId?.name || "",
    amount: e.amount,
    currency: e.currency,
    status: e.status,
    expenseDate: e.expenseDate?.toISOString().slice(0, 10),
  }));
};

const writeCsv = (rows, filePath) => {
  const parser = new CsvParser();
  fs.writeFileSync(filePath, parser.parse(rows));
};

const writeExcel = async (rows, filePath) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report");
  if (rows.length) {
    sheet.columns = Object.keys(rows[0]).map((key) => ({ header: key, key, width: 20 }));
    sheet.addRows(rows);
  }
  await workbook.xlsx.writeFile(filePath);
};

const writePdf = (rows, filePath) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(16).text("ExpenseFlow Enterprise — Report", { align: "center" }).moveDown();
    rows.forEach((row, i) => {
      doc.fontSize(10).text(`${i + 1}. ${row.title} | ${row.employee} | ${row.category} | ${row.currency} ${row.amount} | ${row.status} | ${row.expenseDate}`);
    });
    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

export const startReportWorker = () => {
  const worker = new Worker(
    "report-generation",
    async (job) => {
      const { organizationId, requestedBy, reportType, format, filters } = job.data;
      const rows = await fetchRows(organizationId, reportType, filters);

      const filename = `${reportType}-${Date.now()}.${format === "excel" ? "xlsx" : format}`;
      const filePath = path.join(REPORTS_DIR, filename);

      if (format === "csv") writeCsv(rows, filePath);
      else if (format === "excel") await writeExcel(rows, filePath);
      else await writePdf(rows, filePath);

      await createNotification({
        organizationId,
        userId: requestedBy,
        type: "general",
        title: "Report ready",
        message: `Your ${reportType} report (${format}) has finished generating.`,
        emailAlso: false,
      });

      return { filePath: `/reports/${filename}` };
    },
    { connection: getRedisConnection() }
  );
  worker.on("failed", (job, err) => console.error(`[Report Worker] Job ${job?.id} failed:`, err.message));
  return worker;
};
