# EventFlow Query Execution Output: Query 09

## 1. Query Title & Operational Intent
**Club Organizer Performance Benchmark and Engagement Summary**

* **Description**: Evaluates campus organizers and student societies by aggregating events hosted, student registrations generated, physical attendance verified, and announcements posted.
* **Execution Timestamp**: 2026-11-21T17:57:20.492Z
* **Target Engine**: PostgreSQL (via Prisma ORM / pg adapter)
* **Execution Duration**: 1 ms
* **Rows Returned**: 2

---

## 2. SQL Query Source
```sql
SELECT 
    u.id AS organizer_id,
    u.name AS organizer_name,
    u.email AS organizer_email,
    COUNT(DISTINCT e.id) AS events_organized,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'CONFIRMED') AS total_registrations_handled,
    COUNT(DISTINCT att.id) AS total_attendances_verified,
    COUNT(DISTINCT ann.id) AS announcements_broadcasted
FROM "User" u
JOIN "Event" e ON u.id = e."organizerId"
LEFT JOIN "Registration" r ON e.id = r."eventId"
LEFT JOIN "Attendance" att ON r.id = att."registrationId"
LEFT JOIN "Announcement" ann ON e.id = ann."eventId"
WHERE u.role = 'ORGANIZER'
GROUP BY u.id
ORDER BY events_organized DESC, total_registrations_handled DESC;
```

---

## 3. Actual Tabular Execution Output

| organizer_id | organizer_name | organizer_email | events_organized | total_registrations_handled | total_attendances_verified | announcements_broadcasted |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0544b8de-0457-4b17-abbe-38126f474d6f | E-Cell Club Organizer | organizer1@eventflow.test | 22 | 3 | 0 | 1 |
| 68a8f533-0562-4f47-8a4d-43df7e3bcc63 | Technical Society Organizer | organizer2@eventflow.test | 3 | 1 | 1 | 0 |


---

## 4. Query Analysis & Database Concepts
* **Tables Referenced**: "User", "Event", "organizerId", "Registration", "eventId", "Attendance", "registrationId", "Announcement"
* **Execution Verification**: Query executed successfully against the live PostgreSQL `eventflow` database.
