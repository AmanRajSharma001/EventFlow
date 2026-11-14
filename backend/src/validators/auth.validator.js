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
  rollNumber: z.string().trim().optional(),
  department: z.string().trim().optional(),
  semester: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  role: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || val.toUpperCase() === ROLES.STUDENT,
      {
        message: "Public registration is only permitted for STUDENT. ADMIN and ORGANIZER roles cannot be self-assigned"
      }
    )
    .transform(() => ROLES.STUDENT)
});

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email")
      .optional(),
    identifier: z
      .string()
      .trim()
      .min(1, "Identifier is required")
      .optional(),
    rollNumber: z
      .string()
      .trim()
      .min(1, "Roll number is required")
      .optional(),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required")
  })
  .refine(
    (data) => Boolean(data.email || data.identifier || data.rollNumber),
    {
      message: "Email or Roll Number (URN) is required",
      path: ["email"]
    }
  );
