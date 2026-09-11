const ApiError = require('../utils/ApiError');

// Global error handler — never expose stack traces to users
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    error = new ApiError(409, `${field} '${value}' is already registered.`);
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new ApiError(400, 'Validation failed', messages);
  }

  // Handle Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ID format.`);
  }

  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500
      ? 'An unexpected error occurred. Please try again.'
      : error.message;

  // Log server errors for debugging (not exposed to client)
  if (statusCode >= 500) {
    console.error('❌ Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 handler
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};

module.exports = { errorHandler, notFound };
