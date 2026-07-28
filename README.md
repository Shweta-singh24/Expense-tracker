# ExpenseFlow Enterprise — Backend

Enterprise SaaS expense management platform (MERN + Redis/BullMQ + Socket.io).
Multi-tenant: every organization's data is isolated by `organizationId`, enforced
at the query level in every service.

## Tech Stack

- Node.js + Express 5, MongoDB (Mongoose)
- JWT auth (access + refresh tokens, cookie-based refresh)
- Redis + BullMQ — background jobs (OCR extraction, email delivery, report generation)
- Socket.io — real-time notifications
- Cloudinary (default) or AWS S3 (optional, set `AWS_*` env vars) — receipt/file storage
- ExcelJS / pdfkit / json2csv — report generation
- Docker + docker-compose — containerized deployment (API + Mongo + Redis)

## Setup

```bash
npm install
cp .env.example .env   # fill in your own secrets — .env.example has no real credentials
npm run dev             # nodemon, requires MongoDB + Redis running locally
```

Or with Docker:

```bash
docker compose up --build
```

Set `DISABLE_WORKERS=true` in `.env` to run the API without Redis (background
jobs — OCR, email, reports — just won't fire; everything else works).

## Modules → Routes

| Module | Base Route |
|---|---|
| Authentication | `/api/auth` |
| Profile (self-service) | `/api/profile` |
| Organization Management | `/api/organization` |
| User Management | `/api/users` |
| Department Management | `/api/departments` |
| Branch Management | `/api/branches` |
| Category Management | `/api/categories` |
| Vendor Management | `/api/vendors` |
| Expense + Receipt Management | `/api/expenses` |
| Budget Management | `/api/budgets` |
| Approval Workflow | `/api/approvals` |
| Reimbursement Management | `/api/reimbursements` |
| Payment Management | `/api/payments` |
| Notification Center | `/api/notifications` |
| Audit Logs / Activity Timeline | `/api/audit-logs` |
| Analytics Dashboard + AI Assistant | `/api/analytics` |
| Reports (PDF/Excel/CSV) | `/api/reports` |
| Subscription + Billing | `/api/subscriptions` |
| Super Admin Panel | `/api/super-admin` |

Full request/response contracts are in Swagger at `/api-docs` (existing auth,
profile and expense routes are documented there; newer modules follow the
same `{ success, message, data }` response shape — see `utils/apiResponse.js`).

## Roles

`super_admin` (platform-wide) → `org_admin` → `manager` → `employee`. Every
model that isn't platform-level carries `organizationId`; `protect` +
`authorize(...)` middleware (see `middleware/authMiddleware.js`) enforce role
and tenant scoping on every route. `super_admin` bypasses `authorize()` checks
but not tenant-scoped data (routes that touch tenant data still filter by
`organizationId` unless explicitly a `/api/super-admin/*` route).

## Core Flow

Expense (draft) → submit → AI policy/duplicate check → Approval Workflow
(config-driven via `organization.settings.approvalLevels`) → on final approval:
Budget spend applied + Vendor spend tracked + Reimbursement created →
Reimbursement processed → Payment → Expense marked `reimbursed`. Every step
fires a Notification (Socket.io + queued email) and an Audit Log entry.

## Known stubs (by design — wire your own provider behind the same interface)

- **OCR** (`workers/ocrWorker.js`) — returns a placeholder result; swap
  `runOcr()` for Tesseract.js / AWS Textract / Google Vision.
- **AI Assistant Q&A** (`services/aiService.js: answerAssistantQuery`) —
  returns a canned response unless `OPENAI_API_KEY` is set; wire your LLM
  call there. Auto-categorization and duplicate detection are real
  (rule-based), not stubbed.
- **Payment gateway** (`services/paymentService.js`) — simulates settlement.
  No backend should ever execute a real money transfer without an explicit,
  audited integration — wire Stripe/Razorpay/ACH behind
  `simulateGatewaySettlement()`.

## Project Structure

```
config/       env-driven singletons: db, redis, queue (BullMQ), socket.io, s3, swagger, constants
models/       Mongoose schemas — one per entity in the doc's data model
services/     business logic, called by controllers
controllers/  thin HTTP layer — validation check + service call + response shape
routes/       route wiring: protect() -> authorize() -> validators -> audit() -> controller
middleware/   auth, RBAC, subscription plan gating, rate limiting, error handling, uploads
workers/      BullMQ processors (OCR, email, reports) — started from workers/index.js
validators/   express-validator chains per module
utils/        jwt, email, cloudinary, S3, API response helpers
```

## Profile Module field specification

See `ExpenseFlow_Profile_Module_Spec.md` for the full enterprise Profile
Module design (fields, types, validation, role visibility) — the User model
implements the subset needed by the backend; extend it with any additional
fields from that spec as the frontend needs them.

---

👩‍💻 Original author: Shweta Singh (shwetasingh02415@gmail.com)
