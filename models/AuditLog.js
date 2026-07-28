import mongoose from "mongoose";

// Single collection for every sensitive action across every module —
// deliberately generic (actionType + targetType) rather than one log
// collection per module, per the doc's "Notes for Smooth Coding".
const auditLogSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true }, // null for platform-level Super Admin actions
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    actorRole: { type: String, default: null },
    action: { type: String, required: true }, // e.g. "expense.create", "org.suspend", "budget.update"
    targetType: { type: String, required: true }, // e.g. "Expense", "Organization", "User"
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: null },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

auditLogSchema.index({ organizationId: 1, timestamp: -1 });
auditLogSchema.index({ actorId: 1, timestamp: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
