// Test suite for database query helper functions.
// Verifies student history, attendee lists, upcoming events with active counts,
// and announcement creation and retrieval. Confirms password fields are never exposed.

import { test, after } from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/prisma.js";
import {
  getStudentHistory,
  getEventRegistrations,
  getUpcomingEvents,
  createAnnouncement,
  getEventAnnouncements,
} from "../src/db/queries.js";

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
async function createEvent({ status = "PUBLISHED", capacity = 10, deadlineOffsetMs = 86_400_000, startDateOffsetMs = 2 * 24 * 60 * 60 * 1000 } = {}) {
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
      description: "Test event description",
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

// ==== Test 1: getStudentHistory returns registrations with event and attendance ====
test("getStudentHistory returns student registrations with event details and attendance, newest first", async () => {
  const student = await createUser("STUDENT");
  const event1 = await createEvent();
  const event2 = await createEvent();

  const reg1 = await createRegistration(student.id, event1.id);
  const reg2 = await createRegistration(student.id, event2.id);
  const att1 = await createAttendance(reg1.id);

  const history = await getStudentHistory(student.id);

  assert.equal(history.length, 2, "Student should have 2 registrations in history");
  // Check ordering: newest registration first
  assert.ok(
    new Date(history[0].createdAt) >= new Date(history[1].createdAt),
    "History should be ordered newest first"
  );

  // Find registration for event1 to check nested details
  const foundReg1 = history.find((r) => r.id === reg1.id);
  assert.ok(foundReg1.event, "Registration must include event details");
  assert.equal(foundReg1.event.id, event1.id);
  assert.ok(foundReg1.attendance, "Registration must include attendance check-in");
  assert.equal(foundReg1.attendance.id, att1.id);

  // Confirm organizer password is not exposed
  if (foundReg1.event.organizer) {
    assert.equal(foundReg1.event.organizer.password, undefined, "Organizer password must never be returned");
  }
});

// ==== Test 2: getEventRegistrations returns attendee details without passwords ====
test("getEventRegistrations returns attendee list with student details and attendance without passwords", async () => {
  const event = await createEvent({ capacity: 10 });
  const student1 = await createUser("STUDENT");
  const student2 = await createUser("STUDENT");

  const reg1 = await createRegistration(student1.id, event.id);
  const reg2 = await createRegistration(student2.id, event.id);
  const att1 = await createAttendance(reg1.id);

  const registrations = await getEventRegistrations(event.id);

  assert.equal(registrations.length, 2, "Event should have 2 registrations");

  for (const reg of registrations) {
    assert.ok(reg.student, "Each registration must include student details");
    assert.ok(reg.student.name, "Student name should be present");
    assert.ok(reg.student.email, "Student email should be present");
    // Verify password is never returned
    assert.equal(
      reg.student.password,
      undefined,
      "Student password hash must NEVER be returned in attendee lists"
    );
  }

  const foundReg1 = registrations.find((r) => r.id === reg1.id);
  assert.ok(foundReg1.attendance, "Student 1 should have an attendance record");
  assert.equal(foundReg1.attendance.id, att1.id);

  const foundReg2 = registrations.find((r) => r.id === reg2.id);
  assert.equal(foundReg2.attendance, null, "Student 2 has not checked in yet");
});

// ==== Test 3: getUpcomingEvents returns published future events with registeredCount ====
test("getUpcomingEvents returns published events in future with registeredCount", async () => {
  const event = await createEvent({ status: "PUBLISHED", capacity: 10 });
  const student1 = await createUser("STUDENT");
  const student2 = await createUser("STUDENT");
  const student3 = await createUser("STUDENT");

  // Create 2 CONFIRMED registrations and 1 CANCELLED registration
  await createRegistration(student1.id, event.id, "CONFIRMED");
  await createRegistration(student2.id, event.id, "CONFIRMED");
  await createRegistration(student3.id, event.id, "CANCELLED");

  const upcomingEvents = await getUpcomingEvents();

  // Find our specific test event by its unique title to isolate from seed or existing data
  const foundEvent = upcomingEvents.find((e) => e.title === event.title);
  assert.ok(foundEvent, "Our published test event must be in the upcoming events list");
  assert.equal(foundEvent.id, event.id);
  assert.equal(foundEvent.status, "PUBLISHED");
  // registeredCount should count only active CONFIRMED registrations (2), excluding CANCELLED
  assert.equal(foundEvent.registeredCount, 2, "registeredCount must count only CONFIRMED registrations");

  // Confirm organizer password is not exposed
  if (foundEvent.organizer) {
    assert.equal(foundEvent.organizer.password, undefined, "Organizer password must never be exposed");
  }
});

// ==== Test 4: createAnnouncement creates announcement linked to event and creator ====
test("createAnnouncement creates an announcement record for an event", async () => {
  const event = await createEvent();
  const title = "Important Room Change";
  const message = "The workshop has moved to Auditorium B.";

  const announcement = await createAnnouncement(event.id, event.organizerId, title, message);
  createdIds.announcements.push(announcement.id);

  assert.ok(announcement.id, "Announcement ID must be generated");
  assert.equal(announcement.eventId, event.id);
  assert.equal(announcement.creatorId, event.organizerId);
  assert.equal(announcement.title, title);
  assert.equal(announcement.message, message);
});

// ==== Test 5: getEventAnnouncements returns announcements newest first without password ====
test("getEventAnnouncements returns event announcements newest first without creator password", async () => {
  const event = await createEvent();

  const ann1 = await createAnnouncement(event.id, event.organizerId, "First Announcement", "Doors open at 9 AM.");
  createdIds.announcements.push(ann1.id);

  // Tiny delay to ensure distinct timestamp
  await new Promise((resolve) => setTimeout(resolve, 10));

  const ann2 = await createAnnouncement(event.id, event.organizerId, "Second Announcement", "Free lunch is provided.");
  createdIds.announcements.push(ann2.id);

  const announcements = await getEventAnnouncements(event.id);

  assert.equal(announcements.length, 2, "Should return both announcements for the event");
  // Check ordering: newest announcement first
  assert.ok(
    new Date(announcements[0].createdAt) >= new Date(announcements[1].createdAt),
    "Announcements should be ordered newest first"
  );
  assert.equal(announcements[0].id, ann2.id, "Most recent announcement must be first");

  // Verify creator object is included but password field is absent
  for (const ann of announcements) {
    if (ann.creator) {
      assert.equal(
        ann.creator.password,
        undefined,
        "Creator password hash must never be returned in announcements"
      );
    }
  }
});

