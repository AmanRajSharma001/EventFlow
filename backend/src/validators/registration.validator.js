import { z } from "zod";

export const REGISTRATION_STATUS = Object.freeze({
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  WAITLISTED: "WAITLISTED",
  ATTENDED: "ATTENDED"
});

export const registerForEventSchema = z.object({
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
  department: z
    .string()
    .trim()
    .max(100, "Department cannot exceed 100 characters")
    .optional(),
  semester: z
    .string()
    .trim()
    .max(20, "Semester cannot exceed 20 characters")
    .optional()
});

export const cancelRegistrationSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(300, "Reason cannot exceed 300 characters")
    .optional()
});
