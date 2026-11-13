// Test suite for User model constraints and database behaviors.
// Verifies user creation, email uniqueness enforcement, and default role assignment.
import test, { after } from "node:test";
import assert from "node:assert/strict";
import prisma from "../src/config/prisma.js";

// Array to track IDs of records created during these tests so we can safely clean them up
const createdUserIds = [];

// Helper function to generate a random unique email to keep test data isolated
function generateRandomEmail() {
  return `test-${Date.now()}-${Math.random()}@eventflow.test`;
}

// Cleanup hook run after all tests finish
after(async () => {
  try {
    // Delete ONLY the specific user records created by this test suite
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
  } finally {
    // Disconnect Prisma client so the test process can exit cleanly
    await prisma.$disconnect();
  }
});

// Test 1: Verifies basic user creation and lookup by unique email
test("create a user and read it back by email", async () => {
  const email = generateRandomEmail();

  const created = await prisma.user.create({
    data: {
      name: "Test Student",
      email: email,
      password: "hashed_dummy_password",
    },
  });

  // Track ID for cleanup
  createdUserIds.push(created.id);

  const found = await prisma.user.findUnique({
    where: { email: email },
  });

  assert.ok(found, "User should be found in the database");
  assert.equal(found.id, created.id);
  assert.equal(found.email, email);
  assert.equal(found.name, "Test Student");
});

// Test 2: Verifies that the @unique constraint on email rejects duplicates
test("creating a second user with the same email is rejected", async () => {
  const email = generateRandomEmail();

  // Create the initial user
  const firstUser = await prisma.user.create({
    data: {
      name: "Initial User",
      email: email,
      password: "hashed_dummy_password",
    },
  });
  createdUserIds.push(firstUser.id);

  // Attempt to create a second user with the exact same email
  let duplicateError = null;
  try {
    const secondUser = await prisma.user.create({
      data: {
        name: "Duplicate User",
        email: email,
        password: "another_hashed_password",
      },
    });
    // In case creation unexpectedly succeeded, track for cleanup
    createdUserIds.push(secondUser.id);
  } catch (error) {
    duplicateError = error;
  }

  // P2002 is Prisma's standard error code for unique constraint violation
  assert.ok(duplicateError, "Database must reject duplicate email");
  assert.equal(duplicateError.code, "P2002");
});

// Test 3: Verifies that if no role is supplied, the role column defaults to STUDENT
test("a new user's role defaults to STUDENT", async () => {
  const email = generateRandomEmail();

  const user = await prisma.user.create({
    data: {
      name: "Role Test User",
      email: email,
      password: "hashed_dummy_password",
    },
  });
  createdUserIds.push(user.id);

  assert.equal(user.role, "STUDENT", "Role should default to STUDENT");
});

