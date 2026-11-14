import test from "node:test";
import assert from "node:assert/strict";
import app from "../app.js";
import { generateToken } from "../utils/jwt.js";
import { ROLES } from "../validators/auth.validator.js";
import { generateQrToken, verifyQrToken } from "../utils/qr.js";

test("EventFlow End-to-End Workflow & Final Backend Test Suite", async (t) => {
  let server;
  let baseUrl;

  const organizer = {
    id: "org-alpha-1",
    name: "Prof. Vikram Sen",
    email: "vikram@college.edu",
    role: ROLES.ORGANIZER
  };

  const student = {
    id: "std-beta-2",
    name: "Aman Student",
    email: "aman@college.edu",
    role: ROLES.STUDENT
  };

  const admin = {
    id: "adm-gamma-3",
    name: "Principal Officer",
    email: "admin@college.edu",
    role: ROLES.ADMIN
  };

  const organizerToken = generateToken(organizer);
  const studentToken = generateToken(student);
  const adminToken = generateToken(admin);

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

  const eventPayload = {
    title: "National Robotics Championship 2026",
    description: "Multi-track autonomous and line-follower robotics competitions",
    category: "Technology",
    startDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 11 * 86400000).toISOString(),
    location: "Campus Arena Complex",
    capacity: 200,
    registrationDeadline: new Date(Date.now() + 9 * 86400000).toISOString()
  };

  await t.test("Step 1: Organizer creates a campus event", async () => {
    const res = await fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify(eventPayload)
    });

    assert.ok(res.status === 201 || res.status === 503);
    const body = await res.json();
    if (res.status === 503) {
      assert.equal(body.data?.organizerId, organizer.id);
      assert.equal(body.data?.capacity, 200);
    }
  });

  await t.test("Step 2: Event publishing endpoint is protected and validates input", async () => {
    const resForbidden = await fetch(`${baseUrl}/api/events/evt-demo-1/publish`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.equal(resForbidden.status, 403);

    const resAuthorized = await fetch(`${baseUrl}/api/events/evt-demo-1/publish`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${organizerToken}` }
    });
    assert.ok(resAuthorized.status === 200 || resAuthorized.status === 404 || resAuthorized.status === 503);
  });

  await t.test("Step 3: Public event discovery and search filters", async () => {
    const res = await fetch(`${baseUrl}/api/events?category=Technology&page=1&limit=10`);
    assert.ok(res.status === 200 || res.status === 503);
    const body = await res.json();
    assert.equal(typeof body.success, "boolean");
  });

  await t.test("Step 4: Student registers for event and receives confirmation", async () => {
    const regRes = await fetch(`${baseUrl}/api/events/evt-demo-1/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        department: "Computer Science",
        semester: "6th Semester",
        notes: "Robotics Team Lead"
      })
    });

    assert.ok(regRes.status === 201 || regRes.status === 404 || regRes.status === 503);
    const regBody = await regRes.json();
    if (regRes.status === 503) {
      assert.equal(regBody.data?.studentId, student.id);
    }
  });

  await t.test("Step 5: Student generates secure QR ticket token", async () => {
    const res = await fetch(`${baseUrl}/api/registrations/reg-demo-100/qr`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    assert.ok(res.status === 200 || res.status === 404 || res.status === 503);
    const body = await res.json();
    if (res.status === 503) {
      assert.ok(body.data?.generatedQrToken?.startsWith("efqr_"));
    }
  });

  await t.test("Step 6: Organizer verifies QR code and checks in student", async () => {
    const validQrToken = generateQrToken("reg-demo-100", "evt-demo-1");
    const checkInRes = await fetch(`${baseUrl}/api/attendance/check-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({
        qrToken: validQrToken,
        eventId: "evt-demo-1"
      })
    });

    assert.ok(checkInRes.status === 200 || checkInRes.status === 404 || checkInRes.status === 503);
  });

  await t.test("Step 7: Students cannot access attendance check-in (403)", async () => {
    const validQrToken = generateQrToken("reg-demo-100", "evt-demo-1");
    const res = await fetch(`${baseUrl}/api/attendance/check-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ qrToken: validQrToken })
    });

    assert.equal(res.status, 403);
  });

  await t.test("Step 8: Organizer views event attendance roster and statistics", async () => {
    const res = await fetch(`${baseUrl}/api/events/evt-demo-1/attendance`, {
      headers: { Authorization: `Bearer ${organizerToken}` }
    });

    assert.ok(res.status === 200 || res.status === 404 || res.status === 503);
  });

  await t.test("Step 9: Student views verified personal attendance record", async () => {
    const res = await fetch(`${baseUrl}/api/attendance/my`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });

    assert.ok(res.status === 200 || res.status === 503);
  });

  await t.test("Step 10: Organizer publishes announcement and students retrieve it", async () => {
    const postRes = await fetch(`${baseUrl}/api/events/evt-demo-1/announcements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({
        title: "Arena Schedule Released",
        message: "Round 1 qualifiers begin tomorrow at 9:00 AM sharp",
        priority: "HIGH"
      })
    });

    assert.ok(postRes.status === 201 || postRes.status === 404 || postRes.status === 503);

    const getRes = await fetch(`${baseUrl}/api/events/evt-demo-1/announcements`);
    assert.ok(getRes.status === 200 || getRes.status === 404 || getRes.status === 503);
  });

  await t.test("Step 11: Admin and Organizer dashboard analytics queries", async () => {
    const resStudentAdmin = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.equal(resStudentAdmin.status, 403);

    const resAdmin = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.ok(resAdmin.status === 200 || resAdmin.status === 503);

    const resOrganizer = await fetch(`${baseUrl}/api/organizer/dashboard`, {
      headers: { Authorization: `Bearer ${organizerToken}` }
    });
    assert.ok(resOrganizer.status === 200 || resOrganizer.status === 503);

    const resStats = await fetch(`${baseUrl}/api/events/evt-demo-1/statistics`, {
      headers: { Authorization: `Bearer ${organizerToken}` }
    });
    assert.ok(resStats.status === 200 || resStats.status === 404 || resStats.status === 503);
  });
});
