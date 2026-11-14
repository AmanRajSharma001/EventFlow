import test from "node:test";
import assert from "node:assert/strict";
import app from "../app.js";
import { registerSchema, loginSchema, ROLES } from "../validators/auth.validator.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";

test("EventFlow Backend Auth & Foundation Test Suite", async (t) => {
  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  t.after(() => {
    return new Promise((resolve) => server.close(resolve));
  });

  await t.test("1. Health Endpoint returns 200 and system details", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.message, "EventFlow API is running");
    assert.ok(body.timestamp);
    assert.equal(typeof body.uptime, "number");
  });

  await t.test("2. Registration Validation allows valid student payload", async () => {
    const validPayload = {
      name: "Aman Sharma",
      email: "Aman.Sharma@College.Edu",
      password: "strongPassword123"
    };

    const parsed = registerSchema.safeParse(validPayload);
    assert.equal(parsed.success, true);
    assert.equal(parsed.data.name, "Aman Sharma");
    assert.equal(parsed.data.email, "aman.sharma@college.edu");
    assert.equal(parsed.data.role, ROLES.STUDENT);
  });

  await t.test("3. Registration Validation prevents role tampering and privilege escalation", async () => {
    const adminAttempt = {
      name: "Malicious User",
      email: "hacker@college.edu",
      password: "password123",
      role: "ADMIN"
    };

    const parsedAdmin = registerSchema.safeParse(adminAttempt);
    assert.equal(parsedAdmin.success, false);
    assert.ok(parsedAdmin.error.flatten().fieldErrors.role);

    const organizerAttempt = {
      name: "Unauthorized User",
      email: "user@college.edu",
      password: "password123",
      role: "ORGANIZER"
    };

    const parsedOrganizer = registerSchema.safeParse(organizerAttempt);
    assert.equal(parsedOrganizer.success, false);
    assert.ok(parsedOrganizer.error.flatten().fieldErrors.role);
  });

  await t.test("4. Registration Validation rejects invalid input fields", async () => {
    const badName = registerSchema.safeParse({ name: "A", email: "valid@college.edu", password: "password123" });
    assert.equal(badName.success, false);
    assert.ok(badName.error.flatten().fieldErrors.name);

    const badEmail = registerSchema.safeParse({ name: "Aman", email: "not-an-email", password: "password123" });
    assert.equal(badEmail.success, false);
    assert.ok(badEmail.error.flatten().fieldErrors.email);

    const badPass = registerSchema.safeParse({ name: "Aman", email: "valid@college.edu", password: "short" });
    assert.equal(badPass.success, false);
    assert.ok(badPass.error.flatten().fieldErrors.password);
  });

  await t.test("5. Login Validation enforces valid email and password", async () => {
    const validLogin = loginSchema.safeParse({ email: "student@college.edu", password: "myPassword" });
    assert.equal(validLogin.success, true);

    const missingPass = loginSchema.safeParse({ email: "student@college.edu" });
    assert.equal(missingPass.success, false);

    const invalidEmail = loginSchema.safeParse({ email: "invalid", password: "pass" });
    assert.equal(invalidEmail.success, false);
  });

  await t.test("6. Password Hashing Utility correctly hashes and verifies passwords", async () => {
    const plain = "collegeMajorProject2026";
    const hashed = await hashPassword(plain);

    assert.ok(hashed.startsWith("$2b$"));
    assert.notEqual(plain, hashed);

    const isMatch = await comparePassword(plain, hashed);
    assert.equal(isMatch, true);

    const isWrong = await comparePassword("incorrectPassword", hashed);
    assert.equal(isWrong, false);
  });

  await t.test("7. JWT Utilities sign and verify tokens accurately", async () => {
    const claims = { id: "usr_42", email: "test@college.edu", role: ROLES.STUDENT };
    const token = generateToken(claims);

    assert.equal(typeof token, "string");
    assert.ok(token.length > 30);

    const decoded = verifyToken(token);
    assert.equal(decoded.id, claims.id);
    assert.equal(decoded.email, claims.email);
    assert.equal(decoded.role, claims.role);

    assert.throws(() => {
      verifyToken("tampered.fake.token");
    });
  });

  await t.test("8. Authentication Middleware protects routes against missing or invalid JWT", async () => {
    const resNoAuth = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(resNoAuth.status, 401);
    const bodyNoAuth = await resNoAuth.json();
    assert.equal(bodyNoAuth.success, false);

    const resBadAuth = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: "Bearer bad.token.here" }
    });
    assert.equal(resBadAuth.status, 401);
  });

  await t.test("9. Protected GET /api/auth/me returns safe profile when authenticated", async () => {
    const studentUser = {
      id: "std-9001",
      name: "Aman Sharma",
      email: "aman@college.edu",
      role: ROLES.STUDENT
    };

    const token = generateToken(studentUser);
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.id, studentUser.id);
    assert.equal(body.data.user.name, studentUser.name);
    assert.equal(body.data.user.email, studentUser.email);
    assert.equal(body.data.user.role, studentUser.role);
    assert.equal(body.data.user.password, undefined);
  });

  await t.test("10. Role-Based Authorization restricts access to unauthorized roles", async () => {
    const mockRes = () => {
      return {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(data) { this.body = data; return this; }
      };
    };

    const studentUser = { user: { id: "std_1", role: ROLES.STUDENT } };
    const organizerUser = { user: { id: "org_1", role: ROLES.ORGANIZER } };
    const adminUser = { user: { id: "adm_1", role: ROLES.ADMIN } };

    const requireAdmin = authorizeRoles(ROLES.ADMIN);
    const requireStaff = authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN);

    const res1 = mockRes();
    let nextCalled1 = false;
    requireAdmin(studentUser, res1, () => { nextCalled1 = true; });
    assert.equal(res1.statusCode, 403);
    assert.equal(nextCalled1, false);

    const res2 = mockRes();
    let nextCalled2 = false;
    requireStaff(studentUser, res2, () => { nextCalled2 = true; });
    assert.equal(res2.statusCode, 403);
    assert.equal(nextCalled2, false);

    const res3 = mockRes();
    let nextCalled3 = false;
    requireStaff(organizerUser, res3, () => { nextCalled3 = true; });
    assert.equal(nextCalled3, true);

    const res4 = mockRes();
    let nextCalled4 = false;
    requireAdmin(adminUser, res4, () => { nextCalled4 = true; });
    assert.equal(nextCalled4, true);
  });

  await t.test("11. Database Dependency Status documented when Prisma integration is pending", async () => {
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Aman Sharma",
        email: "aman@college.edu",
        password: "password123"
      })
    });

    assert.equal(regRes.status, 503);
    const regBody = await regRes.json();
    assert.equal(regBody.success, false);
    assert.equal(regBody.dependency?.teammate, "Sagar");
    assert.equal(regBody.data?.role, ROLES.STUDENT);

    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "aman@college.edu",
        password: "password123"
      })
    });

    assert.equal(loginRes.status, 503);
    const loginBody = await loginRes.json();
    assert.equal(loginBody.success, false);
    assert.equal(loginBody.dependency?.teammate, "Sagar");
  });
});
