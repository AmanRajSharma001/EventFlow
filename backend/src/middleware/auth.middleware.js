import { verifyToken } from "../utils/jwt.js";

/**
 * Authentication middleware
 * Verifies JWT token from Authorization Bearer header
 * Attaches decoded user info to req.user
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is missing or malformed"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again"
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or malformed authorization token"
    });
  }
};

/**
 * Role-based authorization middleware
 * Ensures the authenticated user possesses one of the required roles
 * @param {...string} allowedRoles - Allowed user roles (e.g. "ADMIN", "ORGANIZER", "STUDENT")
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "User authentication required before role authorization"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: ${allowedRoles.join(", ")}`
      });
    }

    return next();
  };
};
