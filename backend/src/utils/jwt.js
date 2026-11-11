import jwt from "jsonwebtoken";
import config from "../config/env.js";

/**
 * Generate a signed JWT token
 * @param {object} payload - Claims to embed in token (e.g. id, email, role)
 * @param {object} [options] - Additional jsonwebtoken sign options
 * @returns {string} - Signed JWT
 */
export const generateToken = (payload, options = {}) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    ...options
  });
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token string
 * @returns {object} - Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};
