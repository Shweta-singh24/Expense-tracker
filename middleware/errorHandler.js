// 404 handler — mount after all routes
export const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });

// Global error handler — mount last
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({ success: false, message: "Validation error", errors });
  }

  if (process.env.NODE_ENV === "development") console.error("❌ Error:", err);

  return res.status(statusCode).json({ success: false, message });
};
