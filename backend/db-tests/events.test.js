// Test suite for event database operations.
// Verifies fetching event details with safe organizer fields,
// event creation with authorization and field validation, and organizer-only event updates.

import { test, after } from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/prisma.js";
import {
  getEventById,
  createEvent,
  updateEvent,
} from "../src/db/events.js";

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

// Helper to create valid future date timestamps for event creation tests.
function getValidEventDates() {
  const now = new Date();
  return {
    registrationDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 1 day in future
    startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
    endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days in future
  };
}

// Helper to directly create an event record in the database for test setup.
async function setupTestEvent({ organizerId, status = "PUBLISHED", capacity = 10 } = {}) {
  let finalOrganizerId = organizerId;
  if (!finalOrganizerId) {
    const org = await createUser("ORGANIZER");
    finalOrganizerId = org.id;
  }

  const title = `Event-${Date.now()}-${Math.random()}`;
  const dates = getValidEventDates();
  const event = await prisma.event.create({
    data: {
      title,
      description: "Direct test event description",
      venue: "Main Hall",
      startDate: dates.startDate,
      endDate: dates.endDate,
      registrationDeadline: dates.registrationDeadline,
      capacity,
      status,
      organizerId: finalOrganizerId,
    },
  });
  createdIds.events.push(event.id);
  return event;
}

// Helper to create a registration record for a student and an event.
async function createRegistration(studentId, eventId, status = "REGISTERED") {
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

// ==== Test 1: getEventById returns organizer name and registeredCount and no password ====
test("getEventById returns organizer name and registeredCount and no password", async () => {
  const organizer = await createUser("ORGANIZER");
  const event = await setupTestEvent({ organizerId: organizer.id });
  const student = await createUser("STUDENT");
  await createRegistration(student.id, event.id, "REGISTERED");

  const found = await getEventById(event.id);

  assert.ok(found, "Event should be found");
  assert.equal(found.id, event.id);
  assert.ok(found.organizer, "Organizer relation must be included");
  assert.equal(found.organizer.id, organizer.id);
  assert.equal(found.organizer.name, organizer.name);
  assert.equal(found.organizer.password, undefined, "Organizer password must never be returned");
  assert.equal(found.organizer.email, undefined, "Organizer email must never be returned");
  assert.equal(found.registeredCount, 1, "registeredCount must reflect active registrations");
});

// ==== Test 2: getEventById returns null for a random unknown id ====
test("getEventById returns null for a random unknown id", async () => {
  const result = await getEventById("00000000-0000-0000-0000-000000000000");
  assert.equal(result, null, "Unknown event ID must return null");
});

// ==== Test 3: createEvent works and defaults to DRAFT ====
test("createEvent works and defaults to DRAFT", async () => {
  const organizer = await createUser("ORGANIZER");
  const dates = getValidEventDates();

  const newEvent = await createEvent(organizer.id, {
    title: "New Robotics Meet",
    capacity: 50,
    ...dates,
  });
  createdIds.events.push(newEvent.id);

  assert.ok(newEvent.id, "Event should have an ID");
  assert.equal(newEvent.title, "New Robotics Meet");
  assert.equal(newEvent.capacity, 50);
  assert.equal(newEvent.status, "DRAFT", "Event status must default to DRAFT");
  assert.equal(newEvent.organizerId, organizer.id);
});

// ==== Test 4: createEvent rejects a student ====
test("createEvent rejects a student", async () => {
  const student = await createUser("STUDENT");
  const dates = getValidEventDates();

  await assert.rejects(
    () =>
      createEvent(student.id, {
        title: "Student Party",
        capacity: 20,
        ...dates,
      }),
    (err) => {
      assert.equal(err.message, "Only organizers can create events");
      return true;
    }
  );
});

// ==== Test 5: createEvent rejects capacity 0, end before start, and deadline after start ====
test("createEvent rejects capacity 0, end before start, and deadline after start", async () => {
  const organizer = await createUser("ORGANIZER");
  const dates = getValidEventDates();

  // 1. Capacity 0
  await assert.rejects(
    () =>
      createEvent(organizer.id, {
        title: "Test Capacity",
        capacity: 0,
        ...dates,
      }),
    (err) => {
      assert.equal(err.message, "Capacity must be a positive whole number");
      return true;
    }
  );

  // 2. End date before start date
  await assert.rejects(
    () =>
      createEvent(organizer.id, {
        title: "Invalid End Date",
        capacity: 10,
        registrationDeadline: dates.registrationDeadline,
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      }),
    (err) => {
      assert.equal(err.message, "End date must be after start date");
      return true;
    }
  );

  // 3. Deadline after start date
  await assert.rejects(
    () =>
      createEvent(organizer.id, {
        title: "Invalid Deadline",
        capacity: 10,
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      }),
    (err) => {
      assert.equal(err.message, "Registration deadline must be before the event starts");
      return true;
    }
  );
});

// ==== Test 6: createEvent ignores an unexpected field such as { id: "hack" } ====
test("createEvent ignores an unexpected field such as { id: 'hack' }", async () => {
  const organizer = await createUser("ORGANIZER");
  const dates = getValidEventDates();

  const created = await createEvent(organizer.id, {
    id: "hack",
    title: "Sanitized Event",
    capacity: 15,
    ...dates,
  });
  createdIds.events.push(created.id);

  assert.notEqual(created.id, "hack", "Custom id property must be ignored");
  assert.equal(typeof created.id, "string");
  assert.ok(created.id.length > 20, "Should have a standard generated UUID");
});

// ==== Test 7: updateEvent works for the organizer ====
test("updateEvent works for the organizer", async () => {
  const organizer = await createUser("ORGANIZER");
  const event = await setupTestEvent({ organizerId: organizer.id, capacity: 20 });

  const updated = await updateEvent(event.id, organizer.id, {
    title: "Updated Annual Fest",
    capacity: 25,
    status: "PUBLISHED",
  });

  assert.equal(updated.id, event.id);
  assert.equal(updated.title, "Updated Annual Fest");
  assert.equal(updated.capacity, 25);
  assert.equal(updated.status, "PUBLISHED");
});

// ==== Test 8: updateEvent rejects another organizer ====
test("updateEvent rejects another organizer", async () => {
  const organizer1 = await createUser("ORGANIZER");
  const organizer2 = await createUser("ORGANIZER");
  const event = await setupTestEvent({ organizerId: organizer1.id });

  await assert.rejects(
    () =>
      updateEvent(event.id, organizer2.id, {
        title: "Malicious Edit",
      }),
    (err) => {
      assert.equal(err.message, "Only the event organizer can edit this event");
      return true;
    }
  );
});

// ==== Test 9: updateEvent rejects capacity below the registered count ====
test("updateEvent rejects capacity below the registered count", async () => {
  const organizer = await createUser("ORGANIZER");
  const event = await setupTestEvent({ organizerId: organizer.id, capacity: 10 });

  const student1 = await createUser("STUDENT");
  const student2 = await createUser("STUDENT");
  await createRegistration(student1.id, event.id, "REGISTERED");
  await createRegistration(student2.id, event.id, "REGISTERED");

  await assert.rejects(
    () =>
      updateEvent(event.id, organizer.id, {
        capacity: 1,
      }),
    (err) => {
      assert.equal(err.message, "Capacity cannot be lower than current registrations");
      return true;
    }
  );
});

