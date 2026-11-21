-- ============================================================================
-- EventFlow — Production SQL Query Catalog
-- Target Database: PostgreSQL 14+
-- Data Engineering (DE) Integrated Project Deliverable
--
-- This script contains 12 project-specific, verified SQL queries matching
-- the live EventFlow public schema defined in backend/prisma/schema.prisma.
-- All identifiers use quoted PascalCase matching PostgreSQL table names.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- QUERY 01: Published Events Catalog with Available Seat Calculation
-- Purpose:
--   Powers the student event discovery catalog. Joins Event with User to
--   obtain organizer details and computes current confirmed enrollments
--   and remaining seat vacancies in real time.
-- Concepts: INNER JOIN, LEFT JOIN, FILTER clause, Aggregate Math, GROUP BY.
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- QUERY 02: Detailed Single Event Profile with Announcements and Attendees
-- Purpose:
--   Retrieves a full event profile dossier (e.g. Campus E-Summit 2026),
--   aggregating the total count of broadcast announcements and confirmed attendees.
-- Concepts: Parameterized lookup, Multi-table LEFT JOIN, COUNT(DISTINCT).
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- QUERY 03: Comprehensive Event Participant Roster with Academic Details
-- Purpose:
--   Generates the live participant check-in roster for gate verification staff.
--   Combines student profile data (roll number, department) with registration
--   tickets, QR tokens, and physical entry status.
-- Concepts: 4-Table JOIN (Registration, Event, User, Attendance), CASE expression,
--           COALESCE, String manipulation (SUBSTRING).
-- ----------------------------------------------------------------------------
SELECT 
    r.id AS registration_id,
    e.title AS event_title,
    s.name AS student_name,
    s.email AS student_email,
    COALESCE(s."rollNumber", 'N/A') AS roll_number,
    COALESCE(r.department, s.department, 'Undeclared') AS department,
    COALESCE(r.semester, s.semester, 'N/A') AS semester,
    r.status AS registration_status,
    SUBSTRING(r."qrToken" FROM 1 FOR 8) || '...' AS qr_token_preview,
    CASE 
        WHEN att.id IS NOT NULL THEN 'CHECKED_IN'
        ELSE 'PENDING'
    END AS attendance_status,
    att."checkedInAt" AS check_in_time
FROM "Registration" r
JOIN "Event" e ON r."eventId" = e.id
JOIN "User" s ON r."studentId" = s.id
LEFT JOIN "Attendance" att ON r.id = att."registrationId"
WHERE e.id = '43ada8cb-61a2-4c36-9638-781ea27700ad'
ORDER BY r."createdAt" ASC;


-- ----------------------------------------------------------------------------
-- QUERY 04: Aggregate Capacity Utilization and Attendance Turnout Rate
-- Purpose:
--   Analytical query calculating venue occupancy percentage and physical
--   attendance turnout rate (checked-in students vs confirmed registrants).
-- Concepts: Statistical calculations, NULLIF to prevent division by zero,
--           ROUND, Double aggregation across 1:N and 1:1 relations.
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- QUERY 05: Student Verified Attendance Transcript and Activity Log
-- Purpose:
--   Extracts official student participation records for academic credit,
--   co-curricular portfolios, and certificate issuance.
-- Concepts: Multi-table relational navigation (Attendance -> Registration -> User / Event).
-- ----------------------------------------------------------------------------
SELECT 
    s.name AS student_name,
    s.email AS student_email,
    COALESCE(s."rollNumber", 'N/A') AS roll_number,
    e.title AS event_title,
    e.category AS event_category,
    e.location AS venue,
    e."startDate" AS event_date,
    att."checkedInAt" AS verified_at,
    'QR_CODE_SCAN' AS verification_method
FROM "Attendance" att
JOIN "Registration" r ON att."registrationId" = r.id
JOIN "User" s ON r."studentId" = s.id
JOIN "Event" e ON r."eventId" = e.id
ORDER BY att."checkedInAt" DESC;


-- ----------------------------------------------------------------------------
-- QUERY 06: Event Lifecycle Distribution and Departmental Hosting Metrics
-- Purpose:
--   Provides administrative oversight of campus activities by categorizing
--   events by theme and lifecycle status (DRAFT, PUBLISHED, COMPLETED).
-- Concepts: Multi-attribute GROUP BY, SUM, AVG, COALESCE.
-- ----------------------------------------------------------------------------
SELECT 
    COALESCE(e.category, 'Uncategorized') AS category,
    e.status AS lifecycle_status,
    COUNT(e.id) AS total_events,
    SUM(e.capacity) AS total_capacity,
    ROUND(AVG(e.capacity), 1) AS avg_capacity_per_event
FROM "Event" e
GROUP BY e.category, e.status
ORDER BY e.category, total_events DESC;


-- ----------------------------------------------------------------------------
-- QUERY 07: Tag-Based Event Discovery Using PostgreSQL Array Operator
-- Purpose:
--   Searches events matching specific thematic tags stored in the native
--   PostgreSQL TEXT[] array column.
-- Concepts: Native PostgreSQL array overlap operator (&&), Array literal syntax.
-- ----------------------------------------------------------------------------
SELECT 
    e.id AS event_id,
    e.title,
    e.category,
    e.location,
    e.tags,
    e."startDate" AS start_date,
    e.status
FROM "Event" e
WHERE e.tags && ARRAY['Coding', 'Hackathon', 'Arts', 'Startup', 'Photography']::TEXT[]
ORDER BY e."startDate" ASC;


-- ----------------------------------------------------------------------------
-- QUERY 08: Event Capacity Alert (Events Approaching Full Capacity)
-- Purpose:
--   Alerts campus administrators and organizers to high-demand events
--   that have filled active slots, filtering using a post-aggregation HAVING clause.
-- Concepts: HAVING clause, FILTER aggregate, Decimal ratio calculations.
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- QUERY 09: Club Organizer Performance Benchmark and Engagement Summary
-- Purpose:
--   Evaluates productivity and engagement across club organizers and societies.
-- Concepts: Aggregating across multiple child tables (Events, Registrations,
--           Attendances, Announcements) with DISTINCT to avoid cartesian inflation.
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- QUERY 10: University Administrative Executive KPI Dashboard (CTEs)
-- Purpose:
--   Computes high-level campus metrics in a single query execution using
--   Common Table Expressions (CTEs), suitable for dean and chancellor dashboards.
-- Concepts: Common Table Expressions (WITH), Cross-join scalar projection,
--           Multi-entity aggregation.
-- ----------------------------------------------------------------------------
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


-- ----------------------------------------------------------------------------
-- QUERY 11: Campus Venue Scheduling Conflict and Space Utilization Audit
-- Purpose:
--   Detects scheduling conflicts where multiple active events are booked in
--   the same facility during overlapping time windows.
-- Concepts: Relational self-join, Non-equi join condition (e1.id < e2.id),
--           Temporal interval overlap logic.
-- ----------------------------------------------------------------------------
SELECT 
    e1.location AS venue,
    e1.id AS event_1_id,
    e1.title AS event_1_title,
    e1."startDate" AS event_1_start,
    e1."endDate" AS event_1_end,
    e2.id AS event_2_id,
    e2.title AS event_2_title,
    e2."startDate" AS event_2_start,
    e2."endDate" AS event_2_end
FROM "Event" e1
JOIN "Event" e2 ON e1.location = e2.location 
    AND e1.id < e2.id
    AND e1.status <> 'CANCELLED'
    AND e2.status <> 'CANCELLED'
    AND (
        (e1."startDate" <= e2."endDate" AND e1."endDate" >= e2."startDate")
        OR (e1."endDate" IS NULL AND e1."startDate"::DATE = e2."startDate"::DATE)
    )
ORDER BY e1.location, e1."startDate";


-- ----------------------------------------------------------------------------
-- QUERY 12: Personalized Student Announcement Feed for Enrolled Events
-- Purpose:
--   Powers the student's personalized notification center, filtering broadcasts
--   to only those events where the student holds an active confirmed registration.
-- Concepts: Correlated subquery with EXISTS, Security boundary enforcement.
-- ----------------------------------------------------------------------------
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
