import { z } from "zod";

export const ROLES = Object.freeze({
  STUDENT: "STUDENT",
  ORGANIZER: "ORGANIZER",
  ADMIN: "ADMIN"
});

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Enter a valid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must contain at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),
  role: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || val === ROLES.STUDENT,
      {
        message: "Public registration is only permitted for STUDENT. ADMIN and ORGANIZER roles cannot be self-assigned"
      }
    )
    .transform(() => ROLES.STUDENT)
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Enter a valid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
});
