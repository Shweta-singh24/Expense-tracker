import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { getDashboardAnalytics, getPlatformAnalytics, buildScopeMatch } from "../services/analyticsService.js";
import { forecastNextMonthSpend, answerAssistantQuery } from "../services/aiService.js";

export const getDashboard = async (req, res) => {
  try {
    const data = await getDashboardAnalytics(req.organizationId, buildScopeMatch(req.user));
    return successResponse(res, 200, "Dashboard analytics fetched successfully", data);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch analytics");
  }
};

export const getPlatformDashboard = async (req, res) => {
  try {
    const data = await getPlatformAnalytics();
    return successResponse(res, 200, "Platform analytics fetched successfully", data);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch platform analytics");
  }
};

export const getForecast = async (req, res) => {
  try {
    const employeeId = req.user.role === "employee" ? req.user._id : req.query.employeeId || null;
    const data = await forecastNextMonthSpend(req.organizationId, employeeId);
    return successResponse(res, 200, "Forecast generated successfully", data);
  } catch (err) {
    return errorResponse(res, 500, "Failed to generate forecast");
  }
};

export const askAssistant = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return errorResponse(res, 400, "question is required");
    const data = await answerAssistantQuery(req.organizationId, req.user._id, question);
    return successResponse(res, 200, "Assistant responded", data);
  } catch (err) {
    return errorResponse(res, 500, "Failed to get assistant response");
  }
};
