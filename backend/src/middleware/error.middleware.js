import config from "../config/env.js";

/**
 * Handle 404 for undefined routes
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
};

/**
 * Centralized error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Handle JSON parse syntax errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload in request body"
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";

  const response = {
    success: false,
    message
  };

  if (config.nodeEnv === "development" && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};
