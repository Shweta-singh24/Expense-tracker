import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { listPaymentsService, getPaymentService } from "../services/paymentService.js";

export const getPayments = async (req, res) => {
  try {
    const payments = await listPaymentsService(req.organizationId, req.query);
    return successResponse(res, 200, "Payments fetched successfully", payments);
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch payments");
  }
};

export const getPayment = async (req, res) => {
  try {
    const payment = await getPaymentService(req.organizationId, req.params.id);
    return successResponse(res, 200, "Payment fetched successfully", payment);
  } catch (err) {
    return errorResponse(res, err.status || 500, err.message || "Failed to fetch payment");
  }
};
