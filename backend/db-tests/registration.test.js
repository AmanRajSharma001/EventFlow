// Tests for the capacity‑safe registration transaction.
// Each test creates its own users/events and removes them afterwards.
// Random data is used so tests are idempotent.

import { test, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/prisma.js";
import { registerStudent } from "../src/db/registrations.js";

// Helper to create a user with a random email.
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

// ==== Test 1: normal registration works ====
test("normal registration works", async () => {
  const student = await createUser();
  const event = await createEvent({ capacity: 5 });
  createdIds.users.push(student.id);
  createdIds.events.push(event.id);

  const reg = await registerStudent(student.id, event.id);
  createdIds.registrations.push(reg.id);

  assert.equal(reg.status, "REGISTERED");
  assert.equal(reg.studentId, student.id);
  assert.equal(reg.eventId, event.id);
});

// ==== Test 2: full event is rejected ====
test("full event is rejected", async () => {
  const student1 = await createUser();
  const student2 = await createUser();
  const event = await createEvent({ capacity: 1 });
  createdIds.users.push(student1.id, student2.id);
  createdIds.events.push(event.id);

  // First registration succeeds.
  const reg1 = await registerStudent(student1.id, event.id);
  createdIds.registrations.push(reg1.id);

  // Second registration should fail.
  await assert.rejects(
    () => registerStudent(student2.id, event.id),
    (err) => {
      assert.equal(err.message, "Event is full");
      return true;
    },
  );
});

// ==== Test 3: registration deadline passed ====
test("deadline‑passed is rejected", async () => {
  const student = await createUser();
  const event = await createEvent({ deadlineOffsetMs: -60_000 }); // deadline 1 min ago
  createdIds.users.push(student.id);
  createdIds.events.push(event.id);

  await assert.rejects(
    () => registerStudent(student.id, event.id),
    (err) => {
      assert.equal(err.message, "Registration deadline has passed");
      return true;
    },
  );
});

// ==== Test 4: draft event is rejected ====
test("draft event is rejected", async () => {
  const student = await createUser();
  const event = await createEvent({ status: "DRAFT" });
  createdIds.users.push(student.id);
  createdIds.events.push(event.id);

  await assert.rejects(
    () => registerStudent(student.id, event.id),
    (err) => {
      assert.equal(err.message, "Event is not open for registration");
      return true;
    },
  );
});

// ==== Test 5: cancelled registration can be re‑registered ====
test("cancelled student can register again", async () => {
  const student = await createUser();
  const event = await createEvent({ capacity: 2 });
  createdIds.users.push(student.id);
  createdIds.events.push(event.id);

  // Register then cancel.
  const reg = await registerStudent(student.id, event.id);
  createdIds.registrations.push(reg.id);

  await prisma.registration.update({
    where: { id: reg.id },
    data: { status: "CANCELLED" },
  });

  // Register again.
  const reg2 = await registerStudent(student.id, event.id);
  // The same registration record is updated, not a new one.
  assert.equal(reg2.id, reg.id);
  assert.equal(reg2.status, "REGISTERED");
});

// ==== Test 6: concurrency – only one succeeds when capacity is 1 ====
test("concurrency test – exactly one succeeds", async () => {
  const studentA = await createUser();
  const studentB = await createUser();
  const event = await createEvent({ capacity: 1 });
  createdIds.users.push(studentA.id, studentB.id);
  createdIds.events.push(event.id);

  const promises = [
    registerStudent(studentA.id, event.id),
    registerStudent(studentB.id, event.id),
  ];

  const results = await Promise.allSettled(promises);

  const fulfilled = results.filter((r) => r.status === "fulfilled");
  const rejected = results.filter((r) => r.status === "rejected");

  assert.equal(fulfilled.length, 1, "Exactly one registration should succeed");
  assert.equal(rejected.length, 1, "One registration should fail");

  // Record the successful registration id for cleanup.
  createdIds.registrations.push(fulfilled[0].value.id);
});

