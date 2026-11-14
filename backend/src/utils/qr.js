import crypto from "crypto";
import config from "../config/env.js";

export const generateQrToken = (registrationId, eventId) => {
  if (!registrationId) {
    throw new Error("Registration ID is required to generate QR token");
  }

  const hmac = crypto.createHmac("sha256", config.jwtSecret);
  hmac.update(`${registrationId}:${eventId || ""}`);
  const signature = hmac.digest("hex").slice(0, 24);

  return `efqr_${registrationId}_${signature}`;
};

export const verifyQrToken = (token, expectedRegistrationId, expectedEventId) => {
  if (!token || typeof token !== "string") {
    return false;
  }

  const parts = token.split("_");
  if (parts.length !== 3 || parts[0] !== "efqr") {
    return false;
  }

  const registrationId = parts[1];
  const signature = parts[2];

  if (expectedRegistrationId && registrationId !== expectedRegistrationId) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", config.jwtSecret);
  hmac.update(`${registrationId}:${expectedEventId || ""}`);
  const expectedSignature = hmac.digest("hex").slice(0, 24);

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuf, expBuf);
};
