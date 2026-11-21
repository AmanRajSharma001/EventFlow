# EventFlow Query Execution Output: Query 01

## 1. Query Title & Operational Intent
**Published Events Catalog with Available Seat Calculation**

* **Description**: Retrieves all currently active and published campus events, computing total capacity, confirmed enrollments, and remaining seat vacancies alongside organizer contact details.
* **Execution Timestamp**: 2026-11-21T17:57:20.480Z
* **Target Engine**: PostgreSQL (via Prisma ORM / pg adapter)
* **Execution Duration**: 74 ms
* **Rows Returned**: 3

---

## 2. SQL Query Source
```sql
SELECT 
    e.id AS event_id,
    e.title,
    e.category,
    e.location,
    e."startDate" AS start_date,
    e.capacity AS total_capacity,
    COUNT(r.id) FILTER (WHERE r.status = 'CONFIRMED') AS confirmed_registrations,
    (e.capacity - COUNT(r.id) FILTER (WHERE r.status = 'CONFIRMED')) AS available_seats,
    u.name AS organizer_name,
    u.email AS organizer_email
FROM "Event" e
JOIN "User" u ON e."organizerId" = u.id
LEFT JOIN "Registration" r ON e.id = r."eventId"
WHERE e.status = 'PUBLISHED'
GROUP BY e.id, u.id
ORDER BY e."startDate" ASC;
```

---

## 3. Actual Tabular Execution Output

| event_id | title | category | location | start_date | total_capacity | confirmed_registrations | available_seats | organizer_name | organizer_email |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 43ada8cb-61a2-4c36-9638-781ea27700ad | Campus E-Summit 2026: From Idea to Seed Funding | Entrepreneurship | Sir C.V. Raman Auditorium | 2026-11-21 13:54:40 | 450 | 2 | 448 | E-Cell Club Organizer | organizer1@eventflow.test |
| 655cf8bd-0261-4d5d-afd7-0e2bd21e6ba0 | Chancellor Trophy: Inter-Department Sports Tournament | Sports | University Sports Complex & Turf Ground | 2026-11-28 13:54:40 | 500 | 1 | 499 | E-Cell Club Organizer | organizer1@eventflow.test |
| 0b71fa81-6e08-4e0c-b069-26cc960ce37b | Hackathon 2026: 36-Hour National Code Sprint | Technical | Computing Hub, Block 4 | 2026-12-05 13:54:40 | 300 | 0 | 300 | Technical Society Organizer | organizer2@eventflow.test |


---

## 4. Query Analysis & Database Concepts
* **Tables Referenced**: "startDate", "Event", "User", "organizerId", "Registration", "eventId"
* **Execution Verification**: Query executed successfully against the live PostgreSQL `eventflow` database.
