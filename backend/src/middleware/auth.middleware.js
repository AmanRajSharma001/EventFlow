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
