// Test suite for database analytics helper functions.
// Verifies overall platform metrics, event status distribution,
// single-event attendance rates, and top events by registration counts.

import { test, after } from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/prisma.js";
import {
  getOverallStats,
  getEventsByStatus,
  getEventStats,
  getTopEvents,
} from "../src/db/analytics.js";

// Helper to create a user with a random unique email and default name.
async function createUser(role = "STUDENT") {
  const email = `test-${Date.now()}-${Math.random()}@eventflow.test`;
  const user = await prisma.user.create({
    data: {
      email,
      password: "dummy_hashed_password",
      role,
      name: "Test User",
    },
  });
  createdIds.users.push(user.id);
  return user;
}

// Helper to create an event with a linked organizer and future dates.
// Every event in EventFlow must have an organizerId pointing to a valid User.
async function createEvent({ status = "PUBLISHED", capacity = 20, deadlineOffsetMs = 86_400_000, startDateOffsetMs = 2 * 24 * 60 * 60 * 1000 } = {}) {
  // Create an organizer to own this event
  const organizer = await createUser("ORGANIZER");

  const title = `Event-${Date.now()}-${Math.random()}`;
  const now = new Date();
  const deadline = new Date(now.getTime() + deadlineOffsetMs);
  const startDate = new Date(now.getTime() + startDateOffsetMs);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  const event = await prisma.event.create({
    data: {
      title,
      description: "Test event for analytics",
      location: "Test Hall",
      startDate,
      endDate,
      registrationDeadline: deadline,
      capacity,
      status,
      organizerId: organizer.id,
    },
  });
  createdIds.events.push(event.id);
  return event;
}

// Helper to create a registration record for a student and an event.
async function createRegistration(studentId, eventId, status = "CONFIRMED") {
  const reg = await prisma.registration.create({
    data: {
      studentId,
      eventId,
      status,
    },
  });
  createdIds.registrations.push(reg.id);
  return reg;
}

// Helper to create an attendance check-in record.
async function createAttendance(registrationId) {
  const att = await prisma.attendance.create({
    data: {
      registrationId,
    },
  });
  createdIds.attendances.push(att.id);
  return att;
}

// Keep track of IDs to delete in cleanup after tests finish
let createdIds = {
  attendances: [],
  registrations: [],
  announcements: [],
  events: [],
  users: [],
};

// Cleanup hook: delete created records in reverse dependency order
// (Attendance -> Registrations -> Announcements -> Events -> Users)
after(async () => {
  try {
    if (createdIds.attendances.length > 0) {
      await prisma.attendance.deleteMany({
        where: { id: { in: createdIds.attendances } },
      });
    }
    if (createdIds.registrations.length > 0) {
      await prisma.registration.deleteMany({
        where: { id: { in: createdIds.registrations } },
      });
    }
    if (createdIds.announcements.length > 0) {
      await prisma.announcement.deleteMany({
        where: { id: { in: createdIds.announcements } },
      });
    }
    if (createdIds.events.length > 0) {
      await prisma.event.deleteMany({
        where: { id: { in: createdIds.events } },
      });
    }
    if (createdIds.users.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdIds.users } },
      });
    }
  } finally {
    // Disconnect Prisma so the Node test process exits cleanly
    await prisma.$disconnect();
  }
});

// ==== Test 1: getOverallStats returns expected keys with numeric values ====
test("getOverallStats returns totals with expected keys and numbers", async () => {
  const stats = await getOverallStats();

  assert.ok(stats, "Overall stats object must be returned");
  assert.equal(typeof stats.users, "number", "users count must be a number");
  assert.equal(typeof stats.events, "number", "events count must be a number");
  assert.equal(typeof stats.registrations, "number", "registrations count must be a number");
  assert.equal(typeof stats.attendances, "number", "attendances count must be a number");
  assert.ok(stats.users >= 0);
  assert.ok(stats.events >= 0);
  assert.ok(stats.registrations >= 0);
  assert.ok(stats.attendances >= 0);
});

// ==== Test 2: getEventsByStatus returns numbers for each status ====
test("getEventsByStatus returns numbers for all event statuses", async () => {
  const breakdown = await getEventsByStatus();

  assert.ok(breakdown, "Breakdown object must be returned");
  assert.equal(typeof breakdown.DRAFT, "number", "DRAFT count must be a number");
  assert.equal(typeof breakdown.PUBLISHED, "number", "PUBLISHED count must be a number");
  assert.equal(typeof breakdown.CANCELLED, "number", "CANCELLED count must be a number");
  assert.equal(typeof breakdown.COMPLETED, "number", "COMPLETED count must be a number");
  assert.ok(breakdown.DRAFT >= 0);
  assert.ok(breakdown.PUBLISHED >= 0);
  assert.ok(breakdown.CANCELLED >= 0);
  assert.ok(breakdown.COMPLETED >= 0);
});

// ==== Test 3: getEventStats computes registered, checked-in, and rate accurately ====
test("getEventStats computes registered, checkedIn and percentage rate", async () => {
  const event = await createEvent({ capacity: 10 });

  // Create 4 students and register them
  const student1 = await createUser();
  const student2 = await createUser();
  const student3 = await createUser();
  const student4 = await createUser();

  const reg1 = await createRegistration(student1.id, event.id);
  const reg2 = await createRegistration(student2.id, event.id);
  await createRegistration(student3.id, event.id);
  await createRegistration(student4.id, event.id);

  // Check in 2 students
  await createAttendance(reg1.id);
  await createAttendance(reg2.id);

  const stats = await getEventStats(event.id);

  assert.equal(stats.registered, 4, "registered count should be 4");
  assert.equal(stats.checkedIn, 2, "checkedIn count should be 2");
  assert.equal(stats.rate, 50, "attendance rate should be 50%");

  // Also verify that an event with no registrations returns rate 0
  const emptyEvent = await createEvent();
  const emptyStats = await getEventStats(emptyEvent.id);

  assert.equal(emptyStats.registered, 0, "registered count should be 0");
  assert.equal(emptyStats.checkedIn, 0, "checkedIn count should be 0");
  assert.equal(emptyStats.rate, 0, "attendance rate should be 0 when no one registered");
});

// ==== Test 4: getTopEvents returns events ordered by registration counts ====
test("getTopEvents orders events by registered registrations descending", async () => {
  const eventA = await createEvent();
  const eventB = await createEvent();

  // Register 3 students for eventA
  const s1 = await createUser();
  const s2 = await createUser();
  const s3 = await createUser();
  await createRegistration(s1.id, eventA.id, "CONFIRMED");
  await createRegistration(s2.id, eventA.id, "CONFIRMED");
  await createRegistration(s3.id, eventA.id, "CONFIRMED");

  // Register 1 student for eventB, plus 1 CANCELLED registration
  const s4 = await createUser();
  const s5 = await createUser();
  await createRegistration(s4.id, eventB.id, "CONFIRMED");
  await createRegistration(s5.id, eventB.id, "CANCELLED");

  // Fetch top events with a large enough limit to include our newly created events
  const topEvents = await getTopEvents(100);

  // Locate both test events by their unique titles
  const indexA = topEvents.findIndex((e) => e.title === eventA.title);
  const indexB = topEvents.findIndex((e) => e.title === eventB.title);

  assert.ok(indexA !== -1, "Event A must be in top events list");
  assert.ok(indexB !== -1, "Event B must be in top events list");
  assert.equal(topEvents[indexA].registeredCount, 3, "Event A should have 3 registered");
  assert.equal(topEvents[indexB].registeredCount, 1, "Event B should have 1 registered (ignoring CANCELLED)");

  // Event A (3 registrations) must appear before Event B (1 registration)
  assert.ok(
    indexA < indexB,
    "Event with more registrations (Event A) must appear before Event B"
  );
});

