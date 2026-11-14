import test from "node:test";
import assert from "node:assert/strict";
import app from "../app.js";
import { generateToken } from "../utils/jwt.js";
import { ROLES } from "../validators/auth.validator.js";
import { EVENT_STATUS, createEventSchema, updateEventSchema } from "../validators/event.validator.js";
import { registerForEventSchema, cancelRegistrationSchema } from "../validators/registration.validator.js";

test("EventFlow Event Management & Registration Test Suite", async (t) => {
  let server;
  let baseUrl;

  const organizerUser = {
    id: "org-101",
    name: "Dr. Sharma",
    email: "sharma@college.edu",
    role: ROLES.ORGANIZER
  };

  const studentUser = {
    id: "std-202",
    name: "Aman Student",
    email: "student@college.edu",
    role: ROLES.STUDENT
  };

  const adminUser = {
    id: "adm-303",
    name: "Dean Academic",
    email: "admin@college.edu",
    role: ROLES.ADMIN
  };

  const organizerToken = generateToken(organizerUser);
  const studentToken = generateToken(studentUser);
  const adminToken = generateToken(adminUser);

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

  await t.test("1. Event Validation validates complete future events and rejects invalid dates", async () => {
    const futureDate = new Date(Date.now() + 7 * 86400000).toISOString();
    const futureEndDate = new Date(Date.now() + 8 * 86400000).toISOString();

    const validPayload = {
      title: "Annual Tech Fest 2026",
      description: "Inter-college coding, robotics and web development competitions",
      category: "Technology",
      startDate: futureDate,
      endDate: futureEndDate,
      location: "Main Auditorium & Labs",
      capacity: 300
    };

    const parsed = createEventSchema.safeParse(validPayload);
    assert.equal(parsed.success, true);

    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const badDatePayload = { ...validPayload, startDate: pastDate };
    const badDateResult = createEventSchema.safeParse(badDatePayload);
    assert.equal(badDateResult.success, false);
    assert.ok(badDateResult.error.flatten().fieldErrors.startDate);

    const badCapacityPayload = { ...validPayload, capacity: 0 };
    const badCapResult = createEventSchema.safeParse(badCapacityPayload);
    assert.equal(badCapResult.success, false);
    assert.ok(badCapResult.error.flatten().fieldErrors.capacity);
  });

  await t.test("2. Public can access event listing without authentication", async () => {
    const res = await fetch(`${baseUrl}/api/events?page=1&limit=5`);
    assert.ok(res.status === 200 || res.status === 503);
    const body = await res.json();
    assert.equal(typeof body.success, "boolean");
  });

  await t.test("3. Student is forbidden from creating an event (403)", async () => {
    const futureDate = new Date(Date.now() + 7 * 86400000).toISOString();
    const res = await fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: "Student Unauthorized Event",
        description: "Students should not be permitted to create events directly",
        category: "Workshop",
        startDate: futureDate,
        location: "Room 101",
        capacity: 50
      })
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  await t.test("4. Unauthenticated user is rejected when creating event (401)", async () => {
    const futureDate = new Date(Date.now() + 7 * 86400000).toISOString();
    const res = await fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Anonymous Event",
        description: "Anonymous event creation must be rejected",
        category: "General",
        startDate: futureDate,
        location: "Ground",
        capacity: 100
      })
    });

    assert.equal(res.status, 401);
  });

  await t.test("5. Organizer can submit valid event creation request", async () => {
    const futureDate = new Date(Date.now() + 5 * 86400000).toISOString();
    const res = await fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({
        title: "Machine Learning Boot Camp",
        description: "Two-day hands-on workshop on deep learning architectures",
        category: "Workshop",
        startDate: futureDate,
        location: "Lab Complex 4",
        capacity: 120
      })
    });

    assert.ok(res.status === 201 || res.status === 503);
    const body = await res.json();
    if (res.status === 503) {
      assert.equal(body.dependency?.teammate, "Sagar");
      assert.equal(body.data?.organizerId, organizerUser.id);
      assert.equal(body.data?.status, EVENT_STATUS.DRAFT);
    }
  });

  await t.test("6. Event update validates payload and respects authorization", async () => {
    const resStudent = await fetch(`${baseUrl}/api/events/evt-123`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ title: "Updated Title By Student" })
    });
    assert.equal(resStudent.status, 403);

    const resOrganizer = await fetch(`${baseUrl}/api/events/evt-123`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({ location: "Auditorium Block B" })
    });
    assert.ok(resOrganizer.status === 200 || resOrganizer.status === 404 || resOrganizer.status === 503);
  });

  await t.test("7. Event publishing endpoint requires organizer or admin privileges", async () => {
    const resStudent = await fetch(`${baseUrl}/api/events/evt-123/publish`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.equal(resStudent.status, 403);

    const resOrganizer = await fetch(`${baseUrl}/api/events/evt-123/publish`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${organizerToken}` }
    });
    assert.ok(resOrganizer.status === 200 || resOrganizer.status === 404 || resOrganizer.status === 503);
  });

  await t.test("8. Student can register for event; non-students are forbidden", async () => {
    const resOrgRegister = await fetch(`${baseUrl}/api/events/evt-123/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({ department: "Faculty of IT" })
    });
    assert.equal(resOrgRegister.status, 403);

    const resStudentRegister = await fetch(`${baseUrl}/api/events/evt-123/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        department: "Computer Science",
        semester: "6th Semester",
        notes: "First time participating"
      })
    });
    assert.ok(resStudentRegister.status === 201 || resStudentRegister.status === 404 || resStudentRegister.status === 503);
    if (resStudentRegister.status === 503) {
      const body = await resStudentRegister.json();
      assert.equal(body.dependency?.teammate, "Sagar");
      assert.equal(body.data?.studentId, studentUser.id);
    }
  });

  await t.test("9. Student can view their own registrations list", async () => {
    const res = await fetch(`${baseUrl}/api/registrations/my`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.ok(res.status === 200 || res.status === 503);
  });

  await t.test("10. Organizer and Admin can view event participant list; student cannot", async () => {
    const resStudent = await fetch(`${baseUrl}/api/events/evt-123/registrations`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.equal(resStudent.status, 403);

    const resOrganizer = await fetch(`${baseUrl}/api/events/evt-123/registrations`, {
      headers: { Authorization: `Bearer ${organizerToken}` }
    });
    assert.ok(resOrganizer.status === 200 || resOrganizer.status === 404 || resOrganizer.status === 503);

    const resAdmin = await fetch(`${baseUrl}/api/events/evt-123/registrations`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.ok(resAdmin.status === 200 || resAdmin.status === 404 || resAdmin.status === 503);
  });

  await t.test("11. Registration cancellation endpoint requires authentication", async () => {
    const resUnauth = await fetch(`${baseUrl}/api/registrations/reg-999/cancel`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Unauthenticated attempt" })
    });
    assert.equal(resUnauth.status, 401);

    const resAuth = await fetch(`${baseUrl}/api/registrations/reg-999/cancel`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ reason: "Conflict in schedule" })
    });
    assert.ok(resAuth.status === 200 || resAuth.status === 404 || resAuth.status === 503);
  });

  await t.test("12. Organizer dashboard and event stats require authorized role", async () => {
    const resStudentStats = await fetch(`${baseUrl}/api/events/evt-123/stats`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.equal(resStudentStats.status, 403);

    const resOrgMyEvents = await fetch(`${baseUrl}/api/events/organizer/my`, {
      headers: { Authorization: `Bearer ${organizerToken}` }
    });
    assert.ok(resOrgMyEvents.status === 200 || resOrgMyEvents.status === 503);
  });
});
