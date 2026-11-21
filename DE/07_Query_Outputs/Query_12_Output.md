# EventFlow Query Execution Output: Query 12

## 1. Query Title & Operational Intent
**Personalized Student Announcement Feed for Enrolled Events**

* **Description**: Implements an EXISTS correlated subquery filtering broadcast notices exclusively for events where the specific student has an active confirmed registration.
* **Execution Timestamp**: 2026-11-21T17:57:20.496Z
* **Target Engine**: PostgreSQL (via Prisma ORM / pg adapter)
* **Execution Duration**: 1 ms
* **Rows Returned**: 1

---

## 2. SQL Query Source
```sql
SELECT 
    ann.id AS announcement_id,
    e.title AS event_title,
    ann.title AS announcement_headline,
    ann.message AS announcement_content,
    u.name AS posted_by_organizer,
    ann."createdAt" AS posted_at
FROM "Announcement" ann
JOIN "Event" e ON ann."eventId" = e.id
JOIN "User" u ON ann."creatorId" = u.id
WHERE EXISTS (
    SELECT 1 
    FROM "Registration" r 
    WHERE r."eventId" = e.id 
      AND r."studentId" = '088c478f-0824-47f0-a673-932c1aa82b16'
      AND r.status = 'CONFIRMED'
)
ORDER BY ann."createdAt" DESC;
```

---

## 3. Actual Tabular Execution Output

| announcement_id | event_title | announcement_headline | announcement_content | posted_by_organizer | posted_at |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 50c927f1-ca6f-4715-8dc5-eb32c30e6dcd | Campus E-Summit 2026: From Idea to Seed Funding | Venue Entry Guidelines and Schedule | Please arrive 15 minutes before the inauguration. Keep your student ID and digital QR pass ready for swift check-in at the auditorium gates. | E-Cell Club Organizer | 2026-11-14 13:54:40 |


---

## 4. Query Analysis & Database Concepts
* **Tables Referenced**: "createdAt", "Announcement", "Event", "eventId", "User", "creatorId", "Registration", "studentId"
* **Execution Verification**: Query executed successfully against the live PostgreSQL `eventflow` database.
