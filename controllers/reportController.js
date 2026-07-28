import { validationResult } from "express-validator";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { requestReportService } from "../services/reportService.js";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 422, "Validation failed", errors.array());
    return false;
  }
  return true;
};

export const requestReport = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const { reportType, format, filters } = req.body;
    const result = await requestReportService({
      organizationId: req.organizationId,
      requestedBy: req.user._id,
      reportType,
      format,
      filters,
    });
    return successResponse(res, 202, "Report generation queued — you'll be notified when it's ready", result);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to queue report");
  }
};
