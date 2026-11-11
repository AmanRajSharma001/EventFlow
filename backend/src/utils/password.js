import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Password hash
 */
export const hashPassword = async (password) => {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plain text password against stored hash
 * @param {string} password - Plain text password
 * @param {string} hash - Stored bcrypt hash
 * @returns {Promise<boolean>} - True if password matches hash
 */
export const comparePassword = async (password, hash) => {
  if (!password || !hash) {
    return false;
  }
  return bcrypt.compare(password, hash);
};
