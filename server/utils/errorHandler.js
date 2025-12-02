/**
 * Custom Application Error Class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Sanitize error for client response - NEVER expose sensitive information
 */
function sanitizeError(error, includeStack = false) {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Log full error on server only (with timestamp)
  console.error('❌ Error occurred:', {
    message: error.message,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: error.stack })
  });
  
  // Return sanitized error to client - never expose internal details in production
  const clientError = {
    error: error.isOperational 
      ? error.message 
      : 'An unexpected error occurred. Please try again later.',
    statusCode: error.statusCode || 500
  };
  
  // Only include stack trace in development
  if (isDevelopment && includeStack) {
    clientError.stack = error.stack;
  }
  
  // Only include details if it's an operational error
  if (error.isOperational && error.details) {
    clientError.details = error.details;
  }
  
  return clientError;
}

/**
 * Express error handler middleware
 * This should be the LAST middleware in your app
 */
function errorHandler(err, req, res, next) {
  const sanitized = sanitizeError(err);
  res.status(sanitized.statusCode).json(sanitized);
}

/**
 * Handle async route errors
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { 
  AppError, 
  sanitizeError, 
  errorHandler,
  asyncHandler
};



