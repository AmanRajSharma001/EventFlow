// Test suite for database relation behaviors: foreign keys, unique rules, and cascade deletes.
// Every record created here is tracked and cleaned up in the after hook.
import test, { after } from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/prisma.js";

// Tracks IDs of every record created so we can delete ONLY what we made
const created = {
  attendanceIds: [],
  registrationIds: [],
  eventIds: [],
  userIds: [],
};

// Helper: generate a random unique email so tests never collide with each other or seed data
function randomEmail() {
  return `rel-test-${Date.now()}-${Math.random()}@eventflow.test`;
}

// Helper: generate a random unique event title so findFirst checks stay isolated
function randomTitle() {
  return `Test Event ${Date.now()}-${Math.random()}`;
}

// Helper: create a minimal User record (organizer or student)
async function createUser(role = "ORGANIZER") {
  const user = await prisma.user.create({
    data: {
      name: `Test ${role}`,
      email: randomEmail(),
      password: "dummy_hashed_password",
      role: role,
    },
  });
  created.userIds.push(user.id);
  return user;
}

// Helper: create a minimal Event linked to a given organizer
async function createEvent(organizerId) {
  const now = new Date();
  const event = await prisma.event.create({
    data: {
      title: randomTitle(),
      description: "Test event description",
      location: "Test Venue",
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      capacity: 10,
      organizerId: organizerId,
    },
  });
  created.eventIds.push(event.id);
  return event;
}

// Cleanup hook: delete everything created by this suite in safe dependency order
// (Attendance before Registration, Registration before Event/User, Event before User)
after(async () => {
  try {
    if (created.attendanceIds.length > 0) {
      await prisma.attendance.deleteMany({
        where: { id: { in: created.attendanceIds } },
      });
    }
    if (created.registrationIds.length > 0) {
      await prisma.registration.deleteMany({
        where: { id: { in: created.registrationIds } },
      });
    }
    if (created.eventIds.length > 0) {
      await prisma.event.deleteMany({
        where: { id: { in: created.eventIds } },
      });
    }
    if (created.userIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: created.userIds } },
      });
    }
  } finally {
    // Disconnect Prisma so the Node process can exit cleanly
    await prisma.$disconnect();
  }
});

// Test 1: Verifies that an event's organizer can be fetched via the include relation
test("create an organizer and an event linked to them, read the event back with its organizer included", async () => {
  const organizer = await createUser("ORGANIZER");
  const event = await createEvent(organizer.id);

  const found = await prisma.event.findUnique({
    where: { id: event.id },
    include: { organizer: true },
  });

  assert.ok(found, "Event should be found in database");
  assert.equal(found.organizerId, organizer.id);
  assert.ok(found.organizer, "organizer relation should be included");
  assert.equal(found.organizer.email, organizer.email);
});

// Test 2: Verifies that qrToken is auto-generated and unique per registration
test("create a student and register them for the event, the qrToken is generated and a second student gets a different token", async () => {
  const organizer = await createUser("ORGANIZER");
  const event = await createEvent(organizer.id);
  const student1 = await createUser("STUDENT");
  const student2 = await createUser("STUDENT");

  const reg1 = await prisma.registration.create({
    data: { studentId: student1.id, eventId: event.id },
  });
  created.registrationIds.push(reg1.id);

  const reg2 = await prisma.registration.create({
    data: { studentId: student2.id, eventId: event.id },
  });
  created.registrationIds.push(reg2.id);

  assert.ok(reg1.qrToken, "First registration should have a qrToken");
  assert.ok(reg2.qrToken, "Second registration should have a qrToken");
  assert.notEqual(reg1.qrToken, reg2.qrToken, "Each registration must get a different qrToken");
});

// Test 3: Verifies that @@unique([studentId, eventId]) prevents double registration
test("registering the same student for the same event twice is rejected (P2002)", async () => {
  const organizer = await createUser("ORGANIZER");
  const event = await createEvent(organizer.id);
  const student = await createUser("STUDENT");

  // First registration should succeed
  const reg = await prisma.registration.create({
    data: { studentId: student.id, eventId: event.id },
  });
  created.registrationIds.push(reg.id);

  // Second registration for the exact same pair must fail
  let error = null;
  try {
    await prisma.registration.create({
      data: { studentId: student.id, eventId: event.id },
    });
  } catch (err) {
    error = err;
  }

  assert.ok(error, "Duplicate registration must throw an error");
  assert.equal(error.code, "P2002", "Error code must be P2002 (unique constraint violation)");
});

// Test 4: Verifies that Event.organizerId is a real foreign key (must reference an existing User)
test("creating an event with a non-existent organizerId is rejected (P2003, foreign key)", async () => {
  const fakeOrganizerId = "00000000-0000-0000-0000-000000000000";
  const now = new Date();
  let error = null;

  try {
    const event = await prisma.event.create({
      data: {
        title: randomTitle(),
        description: "Should never be created",
        location: "Nowhere",
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        capacity: 10,
        organizerId: fakeOrganizerId,
      },
    });
    // Track in case the create unexpectedly succeeds, so cleanup still works
    created.eventIds.push(event.id);
  } catch (err) {
    error = err;
  }

  assert.ok(error, "Creating an event with a fake organizerId must throw");
  assert.equal(error.code, "P2003", "Error code must be P2003 (foreign key constraint failed)");
});

// Test 5: Verifies that deleting an organizer who still owns events is blocked (Restrict behavior)
test("deleting an organizer who still has events is rejected (Restrict rule)", async () => {
  const organizer = await createUser("ORGANIZER");
  const event = await createEvent(organizer.id);

  let error = null;
  try {
    // This must fail because the Event still references this User via organizerId
    await prisma.user.delete({ where: { id: organizer.id } });
  } catch (err) {
    error = err;
  }

  assert.ok(error, "Deleting an organizer with linked events must throw");
  // P2003 (foreign key) or P2014 (required relation) are both valid here
  assert.ok(
    error.code === "P2003" || error.code === "P2014",
    `Expected P2003 or P2014, got ${error.code}`
  );

  // Confirm organizer is still in the database after the failed delete
  const stillExists = await prisma.user.findUnique({ where: { id: organizer.id } });
  assert.ok(stillExists, "Organizer must still exist after rejected delete");

  // Cleanup: delete event first, then organizer will be removed by the after hook
  await prisma.event.delete({ where: { id: event.id } });
  created.eventIds.splice(created.eventIds.indexOf(event.id), 1);
});

// Test 6: Verifies that a registration can be checked in once, and a second attendance is rejected
test("creating attendance for a registration works, and a second attendance for the same registration is rejected (P2002)", async () => {
  const organizer = await createUser("ORGANIZER");
  const event = await createEvent(organizer.id);
  const student = await createUser("STUDENT");

  const reg = await prisma.registration.create({
    data: { studentId: student.id, eventId: event.id },
  });
  created.registrationIds.push(reg.id);

  // First check-in must succeed
  const attendance = await prisma.attendance.create({
    data: { registrationId: reg.id },
  });
  created.attendanceIds.push(attendance.id);
  assert.ok(attendance.id, "Attendance should be created successfully");

  // Second check-in for the same registration must fail (@unique on registrationId)
  let error = null;
  try {
    await prisma.attendance.create({ data: { registrationId: reg.id } });
  } catch (err) {
    error = err;
  }

  assert.ok(error, "Duplicate attendance check-in must throw an error");
  assert.equal(error.code, "P2002", "Error code must be P2002 (unique constraint violation)");
});

// Test 7: Verifies that deleting a Registration cascades and removes its Attendance record
test("deleting a registration also deletes its attendance (Cascade)", async () => {
  const organizer = await createUser("ORGANIZER");
  const event = await createEvent(organizer.id);
  const student = await createUser("STUDENT");

  const reg = await prisma.registration.create({
    data: { studentId: student.id, eventId: event.id },
  });
  // Do NOT push to registrationIds — we will delete it manually below

  const attendance = await prisma.attendance.create({
    data: { registrationId: reg.id },
  });
  // Do NOT push to attendanceIds — cascade delete will handle it

  // Delete the registration; Attendance should be removed automatically via onDelete: Cascade
  await prisma.registration.delete({ where: { id: reg.id } });

  const foundAttendance = await prisma.attendance.findUnique({
    where: { id: attendance.id },
  });

  assert.equal(
    foundAttendance,
    null,
    "Attendance must be automatically deleted when its Registration is deleted (Cascade)"
  );
});
