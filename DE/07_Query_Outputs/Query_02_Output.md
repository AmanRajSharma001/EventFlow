# EventFlow Query Execution Output: Query 02

## 1. Query Title & Operational Intent
**Detailed Single Event Profile with Announcements and Registration Summary**

* **Description**: Fetches full profile information for an event (Campus E-Summit 2026), aggregating the total number of broadcast announcements and confirmed attendees.
* **Execution Timestamp**: 2026-11-21T17:57:20.482Z
* **Target Engine**: PostgreSQL (via Prisma ORM / pg adapter)
* **Execution Duration**: 2 ms
* **Rows Returned**: 1

---

## 2. SQL Query Source
```sql
SELECT 
    e.id AS event_id,
    e.title,
    e.description,
    e.location,
    e.category,
    e."price",
    e.coordinator,
    e."startDate" AS start_date,
    e."registrationDeadline" AS registration_deadline,
    COUNT(DISTINCT a.id) AS total_announcements,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'CONFIRMED') AS confirmed_attendees
FROM "Event" e
LEFT JOIN "Announcement" a ON e.id = a."eventId"
LEFT JOIN "Registration" r ON e.id = r."eventId"
WHERE e.id = '43ada8cb-61a2-4c36-9638-781ea27700ad'
GROUP BY e.id;
```

---

## 3. Actual Tabular Execution Output

| event_id | title | description | location | category | price | coordinator | start_date | registration_deadline | total_announcements | confirmed_attendees |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 43ada8cb-61a2-4c36-9638-781ea27700ad | Campus E-Summit 2026: From Idea to Seed Funding | Connect with university alumni founders, angel investors, and venture scouts. Includes a live startup pitching arena with prototype incubation grants. | Sir C.V. Raman Auditorium | Entrepreneurship | Free | Dr. Preeti Deshmukh | 2026-11-21 13:54:40 | 2026-11-19 13:54:40 | 1 | 2 |


---

## 4. Query Analysis & Database Concepts
* **Tables Referenced**: "price", "startDate", "registrationDeadline", "Event", "Announcement", "eventId", "Registration"
* **Execution Verification**: Query executed successfully against the live PostgreSQL `eventflow` database.
