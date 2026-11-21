# EventFlow Query Execution Output: Query 06

## 1. Query Title & Operational Intent
**Event Lifecycle Distribution and Departmental Hosting Metrics**

* **Description**: Groups campus events by category and publication lifecycle status (DRAFT, PUBLISHED, COMPLETED), computing total hosting count and average capacity.
* **Execution Timestamp**: 2026-11-21T17:57:20.489Z
* **Target Engine**: PostgreSQL (via Prisma ORM / pg adapter)
* **Execution Duration**: 1 ms
* **Rows Returned**: 7

---

## 2. SQL Query Source
```sql
SELECT 
    COALESCE(e.category, 'Uncategorized') AS category,
    e.status AS lifecycle_status,
    COUNT(e.id) AS total_events,
    SUM(e.capacity) AS total_capacity,
    ROUND(AVG(e.capacity), 1) AS avg_capacity_per_event
FROM "Event" e
GROUP BY e.category, e.status
ORDER BY e.category, total_events DESC;
```

---

## 3. Actual Tabular Execution Output

| category | lifecycle_status | total_events | total_capacity | avg_capacity_per_event |
| :--- | :--- | :--- | :--- | :--- |
| Competitions | COMPLETED | 1 | 100 | "100" |
| Entrepreneurship | PUBLISHED | 1 | 450 | "450" |
| Sports | PUBLISHED | 1 | 500 | "500" |
| Technical | PUBLISHED | 1 | 300 | "300" |
| Technical | DRAFT | 1 | 250 | "250" |
| Technology | DRAFT | 10 | 2000 | "200" |
| Workshop | DRAFT | 10 | 1200 | "120" |


---

## 4. Query Analysis & Database Concepts
* **Tables Referenced**: "Event"
* **Execution Verification**: Query executed successfully against the live PostgreSQL `eventflow` database.
