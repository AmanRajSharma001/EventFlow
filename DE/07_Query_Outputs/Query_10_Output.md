# EventFlow Query Execution Output: Query 10

## 1. Query Title & Operational Intent
**University Administrative Executive KPI Dashboard (Common Table Expressions)**

* **Description**: Executes a unified campus-wide administrative summary utilizing Common Table Expressions (CTEs) across User, Event, Registration, and Attendance entities.
* **Execution Timestamp**: 2026-11-21T17:57:20.493Z
* **Target Engine**: PostgreSQL (via Prisma ORM / pg adapter)
* **Execution Duration**: 1 ms
* **Rows Returned**: 1

---

## 2. SQL Query Source
```sql
WITH UserStats AS (
    SELECT 
        COUNT(*) AS total_users,
        COUNT(*) FILTER (WHERE role = 'STUDENT') AS total_students,
        COUNT(*) FILTER (WHERE role = 'ORGANIZER') AS total_organizers,
        COUNT(*) FILTER (WHERE role = 'ADMIN') AS total_admins
    FROM "User"
),
EventStats AS (
    SELECT 
        COUNT(*) AS total_events,
        COUNT(*) FILTER (WHERE status = 'PUBLISHED') AS published_events,
        COUNT(*) FILTER (WHERE status = 'DRAFT') AS draft_events,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed_events,
        SUM(capacity) AS cumulative_campus_capacity
    FROM "Event"
),
RegistrationStats AS (
    SELECT 
        COUNT(*) AS total_registrations,
        COUNT(*) FILTER (WHERE status = 'CONFIRMED') AS confirmed_registrations,
        COUNT(*) FILTER (WHERE status = 'CANCELLED') AS cancelled_registrations
    FROM "Registration"
),
AttendanceStats AS (
    SELECT 
        COUNT(*) AS total_checkins
    FROM "Attendance"
)
SELECT 
    u.total_users,
    u.total_students,
    u.total_organizers,
    e.total_events,
    e.published_events,
    e.completed_events,
    e.cumulative_campus_capacity,
    r.confirmed_registrations,
    r.cancelled_registrations,
    a.total_checkins,
    ROUND((a.total_checkins::DECIMAL / NULLIF(r.confirmed_registrations, 0)) * 100, 2) AS campus_wide_turnout_rate_pct
FROM UserStats u, EventStats e, RegistrationStats r, AttendanceStats a;
```

---

## 3. Actual Tabular Execution Output

| total_users | total_students | total_organizers | total_events | published_events | completed_events | cumulative_campus_capacity | confirmed_registrations | cancelled_registrations | total_checkins | campus_wide_turnout_rate_pct |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 21 | 18 | 2 | 25 | 3 | 1 | 4800 | 4 | 0 | 1 | "25" |


---

## 4. Query Analysis & Database Concepts
* **Tables Referenced**: "User", "Event", "Registration", "Attendance"
* **Execution Verification**: Query executed successfully against the live PostgreSQL `eventflow` database.
