/**
 * Global Error Handling Middleware
 * Handles all application errors centrally
 */

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
  });
};

module.exports = errorHandler;
