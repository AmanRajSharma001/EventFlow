import { z } from "zod";

export const EVENT_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED"
});

export const createEventSchema = z.object({
  title: z
    .string({ required_error: "Event title is required" })
    .trim()
    .min(3, "Title must contain at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  description: z
    .string({ required_error: "Event description is required" })
    .trim()
    .min(10, "Description must contain at least 10 characters")
    .max(3000, "Description cannot exceed 3000 characters"),
  category: z
    .string({ required_error: "Category is required" })
    .trim()
    .min(2, "Category must contain at least 2 characters")
    .max(50, "Category cannot exceed 50 characters"),
  startDate: z
    .string({ required_error: "Start date is required" })
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start date format" })
    .refine((val) => new Date(val) > new Date(), { message: "Start date must be in the future" }),
  endDate: z
    .string()
    .optional()
    .refine((val) => val === undefined || !isNaN(Date.parse(val)), { message: "Invalid end date format" }),
  location: z
    .string({ required_error: "Event location is required" })
    .trim()
    .min(2, "Location must contain at least 2 characters")
    .max(200, "Location cannot exceed 200 characters"),
  capacity: z
    .number({ required_error: "Event capacity is required" })
    .int("Capacity must be an integer")
    .positive("Capacity must be greater than zero")
    .max(100000, "Capacity cannot exceed 100,000"),
  registrationDeadline: z
    .string()
    .optional()
    .refine((val) => val === undefined || !isNaN(Date.parse(val)), { message: "Invalid registration deadline format" })
}).refine((data) => {
  if (data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: "End date must be on or after the start date",
  path: ["endDate"]
}).refine((data) => {
  if (data.registrationDeadline) {
    return new Date(data.registrationDeadline) <= new Date(data.startDate);
  }
  return true;
}, {
  message: "Registration deadline must be before or on the event start date",
  path: ["registrationDeadline"]
});

export const updateEventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must contain at least 3 characters")
    .max(150, "Title cannot exceed 150 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, "Description must contain at least 10 characters")
    .max(3000, "Description cannot exceed 3000 characters")
    .optional(),
  category: z
    .string()
    .trim()
    .min(2, "Category must contain at least 2 characters")
    .max(50, "Category cannot exceed 50 characters")
    .optional(),
  startDate: z
    .string()
    .optional()
    .refine((val) => val === undefined || !isNaN(Date.parse(val)), { message: "Invalid start date format" })
    .refine((val) => val === undefined || new Date(val) > new Date(), { message: "Start date must be in the future" }),
  endDate: z
    .string()
    .optional()
    .refine((val) => val === undefined || !isNaN(Date.parse(val)), { message: "Invalid end date format" }),
  location: z
    .string()
    .trim()
    .min(2, "Location must contain at least 2 characters")
    .max(200, "Location cannot exceed 200 characters")
    .optional(),
  capacity: z
    .number()
    .int("Capacity must be an integer")
    .positive("Capacity must be greater than zero")
    .max(100000, "Capacity cannot exceed 100,000")
    .optional(),
  registrationDeadline: z
    .string()
    .optional()
    .refine((val) => val === undefined || !isNaN(Date.parse(val)), { message: "Invalid registration deadline format" })
});

export const eventQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum([EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED, EVENT_STATUS.CANCELLED, EVENT_STATUS.COMPLETED]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  mine: z.enum(["true", "false"]).optional()
});
