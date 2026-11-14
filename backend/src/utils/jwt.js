import jwt from "jsonwebtoken";
import config from "../config/env.js";

export const generateToken = (payload, options = {}) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    ...options
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};
