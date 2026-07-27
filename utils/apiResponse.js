/**
 * Send a consistent success response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {object} [data]
 */
export const successResponse = (res, statusCode, message, data = {}) =>
  res.status(statusCode).json({ success: true, message, data });

/**
 * Send a consistent error response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {any} [errors]
 */
export const errorResponse = (res, statusCode, message, errors = null) =>
  res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });
