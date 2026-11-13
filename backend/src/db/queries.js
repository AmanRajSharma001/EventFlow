// Database query helpers for EventFlow.
// Provides reusable queries for student history, event registrations, upcoming events, and announcements.
// Sensitive fields like password hashes are explicitly excluded from all query results.

import prisma from "../config/prisma.js";

// Returns a student's full registration history, including event details and attendance check-in.
// Results are sorted with newest registrations first.
// Passwords are excluded so sensitive auth hashes are never leaked to client responses.
export async function getStudentHistory(studentId) {
  return await prisma.registration.findMany({
    where: { studentId },
    include: {
      event: {
        include: {
          // Exclude organizer password for security
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      attendance: true,
    },
    orderBy: {
      registeredAt: "desc",
    },
  });
}

// Returns all registrations for a specific event with student name, email, and attendance status.
// We explicitly select only safe public fields for the student (no password field)
// so organizers viewing attendee lists never receive credential hashes.
export async function getEventRegistrations(eventId) {
  return await prisma.registration.findMany({
    where: { eventId },
    include: {
      // Select safe public student fields only; password is intentionally omitted for security
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      attendance: true,
    },
    orderBy: {
      registeredAt: "desc",
    },
  });
}

// Returns all PUBLISHED events whose start date is in the future, ordered by start date ascending.
// Computes and attaches registeredCount (counting active REGISTERED registrations only).
// Organizer password is excluded to keep API payloads secure.
export async function getUpcomingEvents() {
  const now = new Date();
  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      startDate: {
        gt: now,
      },
    },
    include: {
      // Exclude organizer password
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          registrations: {
            where: { status: "REGISTERED" },
          },
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });

  // Attach registeredCount directly on each event object for easy consumption
  return events.map((event) => ({
    ...event,
    registeredCount: event._count?.registrations ?? 0,
  }));
}

// Creates an announcement for an event posted by an organizer or admin.
export async function createAnnouncement(eventId, creatorId, title, message) {
  return await prisma.announcement.create({
    data: {
      eventId,
      creatorId,
      title,
      message,
    },
  });
}

// Returns all announcements posted for an event, ordered with the newest first.
// The creator's password field is omitted from the relation to prevent credential exposure.
export async function getEventAnnouncements(eventId) {
  return await prisma.announcement.findMany({
    where: { eventId },
    include: {
      // Exclude creator password for security
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

