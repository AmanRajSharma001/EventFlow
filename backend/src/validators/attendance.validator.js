import { z } from "zod";

export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: "PRESENT",
  EXCUSED: "EXCUSED",
  LATE: "LATE"
});

export const checkInSchema = z.object({
  qrToken: z
    .string({ required_error: "QR token is required for check-in" })
    .trim()
    .min(5, "Invalid QR token format")
    .max(256, "QR token too long"),
  eventId: z
    .string()
    .trim()
    .optional()
});

export const manualCheckInSchema = z.object({
  registrationId: z.string().trim().optional(),
  eventId: z.string().trim().optional(),
  studentId: z.string().trim().optional(),
  notes: z.string().trim().max(300, "Notes cannot exceed 300 characters").optional()
}).refine((data) => {
  return Boolean(data.registrationId || (data.eventId && data.studentId));
}, {
  message: "Either registrationId OR both eventId and studentId must be provided for manual check-in"
});
