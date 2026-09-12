const config = require('../config/env');
const { sendError } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return sendError(res, messages.join(', '), 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    return sendError(res, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`, 409);
  }

  // Multer limit error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, `File exceeds maximum allowed size of ${Math.round(config.maxFileSize / (1024 * 1024))} MiB`, 400);
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = config.isProduction ? 'Internal server error' : err.message || 'Internal server error';

  return sendError(res, message, statusCode);
};

// 404 handler for undefined API routes
const notFoundHandler = (req, res) => {
  return sendError(res, `API route not found: ${req.method} ${req.originalUrl}`, 404);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
