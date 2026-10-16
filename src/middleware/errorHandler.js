/**
 * Centralized Error Handler Middleware
 * Prevents information leakage and protects sensitive server stack traces.
 */
export function errorHandler(err, req, res, next) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log error on server side
  console.error(`[Server Error] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}:`, err);

  // Handle known MySQL errors safely
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A duplicate record already exists with this information.'
    });
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({
      success: false,
      message: 'Database service is temporarily unavailable. Please try again shortly.'
    });
  }

  // Handle CORS errors
  if (err.message && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed by security policy.'
    });
  }

  // Generic 500 Server Error
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'An unexpected server error occurred.' : err.message,
    ...(isDevelopment && { stack: err.stack })
  });
}

/**
 * 404 Not Found Middleware
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
}

