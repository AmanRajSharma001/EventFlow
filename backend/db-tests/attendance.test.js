// Test suite for attendance check-in and registration cancellation.
// Verifies QR token verification, duplicate check-in rejection, and cancellation rules.

import { test, after } from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/prisma.js";
import { cancelRegistration, checkInByQrToken } from "../src/db/attendance.js";

// Helper to create a user with a random unique email and default name.
async function createUser(role = "STUDENT") {
  const email = `test-${Date.now()}-${Math.random()}@eventflow.test`;
  const user = await prisma.user.create({
    data: {
      email,
      password: "dummy",
      role,
      name: "Test User",
    },
  });
  return user;
}

// Helper to create an event with a linked organizer.
// Every event in EventFlow must have an organizerId pointing to a valid User.
async function createEvent({ status = "PUBLISHED", capacity = 5, deadlineOffsetMs = 86_400_000 }) {
  // Create an organizer to own this event and track their ID for cleanup
  const organizer = await createUser("ORGANIZER");
  createdIds.users.push(organizer.id);

  const title = `Event-${Date.now()}-${Math.random()}`;
  const now = new Date();
  const deadline = new Date(now.getTime() + deadlineOffsetMs);
  const event = await prisma.event.create({
    data: {
      title,
      description: "test event",
      venue: "Test Hall",
      startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      registrationDeadline: deadline,
      capacity,
      status,
      organizerId: organizer.id,
    },
  });
  return event;
}

// Helper to create a registration for a student and an event.
async function createRegistration(studentId, eventId) {
  const reg = await prisma.registration.create({
    data: {
      studentId,
      eventId,
      status: "REGISTERED",
    },
  });
  createdIds.registrations.push(reg.id);
  return reg;
}

// Keep track of IDs to delete in cleanup after tests finish
let createdIds = {
  attendances: [],
  registrations: [],
  events: [],
  users: [],
};

// Cleanup hook: delete created records in reverse dependency order
// (Attendance before Registration, Registration before Event/User, Event before User)
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

// ==== Test 1: valid check-in works ====
test("valid check-in works", async () => {
  const student = await createUser();
  const event = await createEvent({ capacity: 5 });
  createdIds.users.push(student.id);
  createdIds.events.push(event.id);

  const reg = await createRegistration(student.id, event.id);

  const attendance = await checkInByQrToken(reg.qrToken);
  createdIds.attendances.push(attendance.id);

  assert.ok(attendance, "Attendance record should be created");
  assert.equal(attendance.registrationId, reg.id, "Attendance should link to the registration");
});

// ==== Test 2: scanning the same code twice is rejected ====
test("scanning the same code twice is rejected", async () => {
  const student = await createUser();
  const event = await createEvent({ capacity: 5 });
  createdIds.users.push(student.id);
  createdIds.events.push(event.id);

  const reg = await createRegistration(student.id, event.id);

  const attendance = await checkInByQrToken(reg.qrToken);
  createdIds.attendances.push(attendance.id);

  await assert.rejects(
    () => checkInByQrToken(reg.qrToken),
    (err) => {
      assert.equal(err.message, "Already checked in");
      return true;
    }
  );
});

// ==== Test 3: unknown code rejected ====
test("unknown code rejected", async () => {
  const fakeToken = `invalid-token-${Date.now()}`;

  await assert.rejects(
    () => checkInByQrToken(fakeToken),
    (err) => {
      assert.equal(err.message, "Invalid QR code");
      return true;
    }
  );
});

// ==== Test 4: cancelled registration is rejected for check-in ====
test("cancelled registration is rejected for check-in", async () => {
  const student = await createUser();
  const event = await createEvent({ capacity: 5 });
  createdIds.users.push(student.id);
  createdIds.events.push(event.id);

  const reg = await createRegistration(student.id, event.id);

  // Cancel the registration
  await cancelRegistration(reg.id);

  // Attempting to check in with the cancelled registration QR token must fail
  await assert.rejects(
    () => checkInByQrToken(reg.qrToken),
    (err) => {
      assert.equal(err.message, "Registration was cancelled");
      return true;
    }
  );
});

// ==== Test 5: a checked-in registration cannot be cancelled ====
test("a checked-in registration cannot be cancelled", async () => {
  const student = await createUser();
  const event = await createEvent({ capacity: 5 });
  createdIds.users.push(student.id);
  createdIds.events.push(event.id);

  const reg = await createRegistration(student.id, event.id);

  // Check in the student
  const attendance = await checkInByQrToken(reg.qrToken);
  createdIds.attendances.push(attendance.id);

  // Attempting to cancel after check-in must fail
  await assert.rejects(
    () => cancelRegistration(reg.id),
    (err) => {
      assert.equal(err.message, "Already checked in, cannot cancel");
      return true;
    }
  );
});

