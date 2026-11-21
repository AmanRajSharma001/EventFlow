# EventFlow Query Execution Output: Query 04

## 1. Query Title & Operational Intent
**Aggregate Capacity Utilization and Attendance Turnout Rate per Event**

* **Description**: Computes statistical ratios including seat occupancy percentage against capacity and physical turnout rate (checked-in students vs. total confirmed registrants).
* **Execution Timestamp**: 2026-11-21T17:57:20.487Z
* **Target Engine**: PostgreSQL (via Prisma ORM / pg adapter)
* **Execution Duration**: 2 ms
* **Rows Returned**: 25

---

## 2. SQL Query Source
```sql
SELECT 
    e.id AS event_id,
    e.title,
    e.category,
    e.capacity,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'CONFIRMED') AS confirmed_registrations,
    ROUND((COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'CONFIRMED')::DECIMAL / NULLIF(e.capacity, 0)) * 100, 2) AS occupancy_pct,
    COUNT(DISTINCT att.id) AS checked_in_count,
    ROUND((COUNT(DISTINCT att.id)::DECIMAL / NULLIF(COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'CONFIRMED'), 0)) * 100, 2) AS turnout_rate_pct
FROM "Event" e
LEFT JOIN "Registration" r ON e.id = r."eventId"
LEFT JOIN "Attendance" att ON r.id = att."registrationId"
GROUP BY e.id
ORDER BY confirmed_registrations DESC;
```

---

## 3. Actual Tabular Execution Output

| event_id | title | category | capacity | confirmed_registrations | occupancy_pct | checked_in_count | turnout_rate_pct |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 43ada8cb-61a2-4c36-9638-781ea27700ad | Campus E-Summit 2026: From Idea to Seed Funding | Entrepreneurship | 450 | 2 | "0.44" | 0 | "0" |
| 5958f784-7cb6-4768-bd4d-8d9f63e92c4f | Chroma Lens: Annual Campus Photography Contest | Competitions | 100 | 1 | "1" | 1 | "100" |
| 655cf8bd-0261-4d5d-afd7-0e2bd21e6ba0 | Chancellor Trophy: Inter-Department Sports Tournament | Sports | 500 | 1 | "0.2" | 0 | "0" |
| 4a2e4431-72cc-43d7-9043-b04ff4e94152 | Machine Learning Boot Camp | Workshop | 120 | 0 | "0" | 0 | *NULL* |
| 4b2846b3-da50-423e-a998-d24ee419c869 | Machine Learning Boot Camp | Workshop | 120 | 0 | "0" | 0 | *NULL* |
| 50228b44-6c0b-4efd-b404-ab8ac03fcc6d | National Robotics Championship 2026 | Technology | 200 | 0 | "0" | 0 | *NULL* |
| 5373736d-8326-4405-bad5-f265b61692b4 | Machine Learning Boot Camp | Workshop | 120 | 0 | "0" | 0 | *NULL* |
| 76f2cc96-bc86-45e9-b9be-9e6c3f8b6fcc | National Robotics Championship & Drone Racing | Technical | 250 | 0 | "0" | 0 | *NULL* |
| 7ad4e0f8-3d54-4f3c-a5cd-2b683a67e93f | National Robotics Championship 2026 | Technology | 200 | 0 | "0" | 0 | *NULL* |
| 8b429401-922f-4efe-8d64-f3a4b799227c | National Robotics Championship 2026 | Technology | 200 | 0 | "0" | 0 | *NULL* |
| 96779c9f-66f2-4c68-8695-9f436105ae62 | National Robotics Championship 2026 | Technology | 200 | 0 | "0" | 0 | *NULL* |
| 9e67274d-b42c-462c-9837-488dc4a2a2c4 | Machine Learning Boot Camp | Workshop | 120 | 0 | "0" | 0 | *NULL* |
| a7c82c3a-ce5d-4248-b7d8-5532d753b7c5 | National Robotics Championship 2026 | Technology | 200 | 0 | "0" | 0 | *NULL* |
| b33cc6a5-0194-41a5-87c3-970169a96c5f | Machine Learning Boot Camp | Workshop | 120 | 0 | "0" | 0 | *NULL* |
| bab7f656-8ff8-4b5f-977a-0b0b90a6bd66 | Machine Learning Boot Camp | Workshop | 120 | 0 | "0" | 0 | *NULL* |
| d106f592-4c86-4a2d-a6c5-fbee0926060f | National Robotics Championship 2026 | Technology | 200 | 0 | "0" | 0 | *NULL* |
| d670114f-bbf7-4729-bddf-b36b8cf47508 | Machine Learning Boot Camp | Workshop | 120 | 0 | "0" | 0 | *NULL* |
| d712523a-8dfb-4a02-9567-cf361d4c4790 | Machine Learning Boot Camp | Workshop | 120 | 0 | "0" | 0 | *NULL* |
| dfc27b4f-b5c7-462b-aaae-5b3c198de69a | National Robotics Championship 2026 | Technology | 200 | 0 | "0" | 0 | *NULL* |
| e0184ef4-db34-4b7d-9b08-1d53b0679cda | National Robotics Championship 2026 | Technology | 200 | 0 | "0" | 0 | *NULL* |
| e20e5099-bc36-4325-9d65-c078b36caf81 | Machine Learning Boot Camp | Workshop | 120 | 0 | "0" | 0 | *NULL* |
| 0b71fa81-6e08-4e0c-b069-26cc960ce37b | Hackathon 2026: 36-Hour National Code Sprint | Technical | 300 | 0 | "0" | 0 | *NULL* |
| fcd9f7f3-0b73-49df-a4bb-6dfae5f3edf8 | National Robotics Championship 2026 | Technology | 200 | 0 | "0" | 0 | *NULL* |
| 21d0e1e6-1476-489c-8ef2-70b4f1f35199 | Machine Learning Boot Camp | Workshop | 120 | 0 | "0" | 0 | *NULL* |
| 2a65c4d9-bac3-4bd1-bfd5-8e62ee86b396 | National Robotics Championship 2026 | Technology | 200 | 0 | "0" | 0 | *NULL* |


---

## 4. Query Analysis & Database Concepts
* **Tables Referenced**: "Event", "Registration", "eventId", "Attendance", "registrationId"
* **Execution Verification**: Query executed successfully against the live PostgreSQL `eventflow` database.
