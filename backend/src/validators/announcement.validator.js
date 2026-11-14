import { z } from "zod";

export const ANNOUNCEMENT_PRIORITY = Object.freeze({
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT"
});

export const createAnnouncementSchema = z.object({
  title: z
    .string({ required_error: "Announcement title is required" })
    .trim()
    .min(3, "Title must contain at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  message: z
    .string()
    .trim()
    .min(5, "Message must contain at least 5 characters")
    .max(3000, "Message cannot exceed 3000 characters")
    .optional(),
  content: z
    .string()
    .trim()
    .min(5, "Content must contain at least 5 characters")
    .max(3000, "Content cannot exceed 3000 characters")
    .optional(),
  priority: z
    .enum([
      ANNOUNCEMENT_PRIORITY.LOW,
      ANNOUNCEMENT_PRIORITY.NORMAL,
      ANNOUNCEMENT_PRIORITY.HIGH,
      ANNOUNCEMENT_PRIORITY.URGENT
    ])
    .default(ANNOUNCEMENT_PRIORITY.NORMAL),
  isPinned: z.boolean().default(false)
}).refine((data) => Boolean(data.message || data.content), {
  message: "Announcement message or content is required",
  path: ["message"]
}).transform((data) => ({
  ...data,
  message: data.message || data.content
}));
