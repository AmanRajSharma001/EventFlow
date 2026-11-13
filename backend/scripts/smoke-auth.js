// Smoke test script for end-to-end authentication flow.
// Spins up the Express app on an ephemeral port to verify real database interaction
// across registration, login, duplicate rejection, and profile access.

import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

async function runSmokeAuth() {
  const email = `smoke-${Date.now()}@eventflow.test`;
  const password = "Password@123";
  const wrongPassword = "WrongPassword@999";
  const name = "Smoke Test User";

  let server;
  let hasFailed = false;

  // Step 1: Start the Express server on a dynamically assigned free port
  server = await new Promise((resolve, reject) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
    s.on("error", reject);
  });

  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Smoke test server listening on ${baseUrl}\n`);

  try {
    let registerToken = null;
    let loginToken = null;

    // Step 2: Test registration with valid user credentials
    // Expecting 201 Created and an issued JWT token
    console.log("Step 1: POST /api/auth/register (new user)");
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const regData = await regRes.json().catch(() => ({}));
    if (regRes.status === 201 && regData?.data?.token) {
      registerToken = regData.data.token;
      console.log("  PASS - User registered successfully (201 Created)");
    } else {
      hasFailed = true;
      console.log(`  FAIL - Expected 201 with token, got ${regRes.status}:`, regData?.message || regData);
    }

    // Step 3: Test duplicate registration with the same email
    // Expecting 409 Conflict rejection
    console.log("\nStep 2: POST /api/auth/register (duplicate email)");
    const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const dupData = await dupRes.json().catch(() => ({}));
    if (dupRes.status === 409) {
      console.log("  PASS - Duplicate email rejected (409 Conflict)");
    } else {
      hasFailed = true;
      console.log(`  FAIL - Expected 409, got ${dupRes.status}:`, dupData?.message || dupData);
    }

    // Step 4: Test login with valid email and password
    // Expecting 200 OK and an issued JWT token
    console.log("\nStep 3: POST /api/auth/login (correct password)");
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginRes.json().catch(() => ({}));
    if (loginRes.status === 200 && loginData?.data?.token) {
      loginToken = loginData.data.token;
      console.log("  PASS - Login succeeded (200 OK)");
    } else {
      hasFailed = true;
      console.log(`  FAIL - Expected 200 with token, got ${loginRes.status}:`, loginData?.message || loginData);
    }

    // Step 5: Test login with an incorrect password
    // Expecting 401 Unauthorized rejection
    console.log("\nStep 4: POST /api/auth/login (wrong password)");
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: wrongPassword }),
    });

    const badLoginData = await badLoginRes.json().catch(() => ({}));
    if (badLoginRes.status === 401) {
      console.log("  PASS - Incorrect password rejected (401 Unauthorized)");
    } else {
      hasFailed = true;
      console.log(`  FAIL - Expected 401, got ${badLoginRes.status}:`, badLoginData?.message || badLoginData);
    }

    // Step 6: Test profile retrieval using the Bearer JWT token
    // Expecting 200 OK and matching authenticated user profile
    console.log("\nStep 5: GET /api/auth/me (authenticated profile)");
    const activeToken = loginToken || registerToken;
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    });

    const meData = await meRes.json().catch(() => ({}));
    if (meRes.status === 200 && meData?.data?.user?.email === email) {
      console.log("  PASS - User profile retrieved successfully (200 OK)");
    } else {
      hasFailed = true;
      console.log(`  FAIL - Expected 200 with user profile, got ${meRes.status}:`, meData?.message || meData);
    }
  } finally {
    // Step 7: Teardown and cleanup of test data and network/database handles
    console.log("\nCleaning up smoke test resources...");
    try {
      await prisma.user.deleteMany({
        where: { email },
      });
      console.log("Smoke test user deleted.");
    } catch (cleanupError) {
      console.error("Error cleaning up smoke test user:", cleanupError.message);
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log("Smoke test HTTP server closed.");
    }

    await prisma.$disconnect();
    console.log("Database connection closed.");
  }

  // Step 8: Exit with non-zero code if any step failed
  if (hasFailed) {
    console.log("\nSmoke test FAILED.");
    process.exit(1);
  } else {
    console.log("\nAll smoke tests PASSED.");
    process.exit(0);
  }
}

runSmokeAuth().catch((err) => {
  console.error("Unexpected smoke test failure:", err);
  process.exit(1);
});

