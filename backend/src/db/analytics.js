// Database analytics helper functions for EventFlow.
// Aggregates platform statistics, status breakdowns, event attendance rates, and popular events.
// Built with Prisma count, groupBy, and findMany operations without raw SQL.

import prisma from "../config/prisma.js";

// Returns high-level platform totals across all core models:
// total users, total events, active registrations (REGISTERED status only), and total attendances.
export async function getOverallStats() {
  const [users, events, registrations, attendances] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.registration.count({
      where: { status: "REGISTERED" },
    }),
    prisma.attendance.count(),
  ]);

  return {
    users,
    events,
    registrations,
    attendances,
  };
}

// Returns the distribution of events grouped by their lifecycle status.
// Ensures every status enum (DRAFT, PUBLISHED, CANCELLED, COMPLETED) is present, even if count is 0.
export async function getEventsByStatus() {
  const groups = await prisma.event.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  // Default counts initialized to 0 for all possible EventStatus values
  const counts = {
    DRAFT: 0,
    PUBLISHED: 0,
    CANCELLED: 0,
    COMPLETED: 0,
  };

  // Populate actual counts from the database grouping
  for (const group of groups) {
    counts[group.status] = group._count.id;
  }

  return counts;
}

// Calculates attendance metrics for a single event:
// active registered count, checked-in count, and attendance rate as a percentage rounded to 1 decimal place.
export async function getEventStats(eventId) {
  const registered = await prisma.registration.count({
    where: {
      eventId,
      status: "REGISTERED",
    },
  });

  // Count attendance records associated with registrations for this event
  const checkedIn = await prisma.attendance.count({
    where: {
      registration: {
        eventId,
      },
    },
  });

  // Compute attendance percentage rounded to 1 decimal; defaults to 0 if no registrations
  const rate = registered > 0 ? Number(((checkedIn / registered) * 100).toFixed(1)) : 0;

  return {
    registered,
    checkedIn,
    rate,
  };
}

// Returns events sorted by active registration count in descending order.
// Attaches registeredCount to each event object and limits the result size.
export async function getTopEvents(limit = 10) {
  const events = await prisma.event.findMany({
    include: {
      _count: {
        select: {
          registrations: {
            where: { status: "REGISTERED" },
          },
        },
      },
    },
  });

  // Attach registeredCount and sort highest active registrations first
  const sorted = events
    .map((event) => ({
      ...event,
      registeredCount: event._count?.registrations ?? 0,
    }))
    .sort((a, b) => b.registeredCount - a.registeredCount);

  if (typeof limit === "number") {
    return sorted.slice(0, limit);
  }
  return sorted;
}

