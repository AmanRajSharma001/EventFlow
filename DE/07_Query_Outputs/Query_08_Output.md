# EventFlow Query Execution Output: Query 08

## 1. Query Title & Operational Intent
**Event Capacity Alert (Events Reaching or Approaching Seat Limit)**

* **Description**: Monitors active registrations across published events to identify high-demand workshops, filtering with a HAVING clause for events with active enrollments.
* **Execution Timestamp**: 2026-11-21T17:57:20.491Z
* **Target Engine**: PostgreSQL (via Prisma ORM / pg adapter)
* **Execution Duration**: 1 ms
* **Rows Returned**: 2

---

## 2. SQL Query Source
```sql
SELECT 
    e.id AS event_id,
    e.title,
    e.capacity AS total_capacity,
    COUNT(r.id) FILTER (WHERE r.status = 'CONFIRMED') AS active_registrations,
    (e.capacity - COUNT(r.id) FILTER (WHERE r.status = 'CONFIRMED')) AS remaining_seats,
    ROUND((COUNT(r.id) FILTER (WHERE r.status = 'CONFIRMED')::DECIMAL / e.capacity) * 100, 2) AS seat_utilization_pct
FROM "Event" e
JOIN "Registration" r ON e.id = r."eventId"
WHERE e.status = 'PUBLISHED'
GROUP BY e.id
HAVING COUNT(r.id) FILTER (WHERE r.status = 'CONFIRMED') > 0
ORDER BY seat_utilization_pct DESC;
```

---

## 3. Actual Tabular Execution Output

| event_id | title | total_capacity | active_registrations | remaining_seats | seat_utilization_pct |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 43ada8cb-61a2-4c36-9638-781ea27700ad | Campus E-Summit 2026: From Idea to Seed Funding | 450 | 2 | 448 | "0.44" |
| 655cf8bd-0261-4d5d-afd7-0e2bd21e6ba0 | Chancellor Trophy: Inter-Department Sports Tournament | 500 | 1 | 499 | "0.2" |


---

## 4. Query Analysis & Database Concepts
* **Tables Referenced**: "Event", "Registration", "eventId"
* **Execution Verification**: Query executed successfully against the live PostgreSQL `eventflow` database.
