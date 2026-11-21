# EventFlow Query Execution Output: Query 03

## 1. Query Title & Operational Intent
**Comprehensive Event Participant Roster with Academic Details and Verification Status**

* **Description**: Joins Registration, User, Event, and Attendance tables to generate a check-in roster for gate security, showing roll number, department, QR token preview, and entry status.
* **Execution Timestamp**: 2026-11-21T17:57:20.484Z
* **Target Engine**: PostgreSQL (via Prisma ORM / pg adapter)
* **Execution Duration**: 2 ms
* **Rows Returned**: 2

---

## 2. SQL Query Source
```sql
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
```

---

## 3. Actual Tabular Execution Output

| registration_id | event_title | student_name | student_email | roll_number | department | semester | registration_status | qr_token_preview | attendance_status | check_in_time |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 5ef833f6-ce84-44cf-83a4-af31d1c26aa5 | Campus E-Summit 2026: From Idea to Seed Funding | Student 1 | student1@eventflow.test | N/A | Undeclared | N/A | CONFIRMED | 24790166... | PENDING | *NULL* |
| 6f23be8e-6fb4-4e1c-8bdc-3f27dc7d341e | Campus E-Summit 2026: From Idea to Seed Funding | Student 2 | student2@eventflow.test | N/A | Undeclared | N/A | CONFIRMED | 8b2ff628... | PENDING | *NULL* |


---

## 4. Query Analysis & Database Concepts
* **Tables Referenced**: "rollNumber", "qrToken", "checkedInAt", "Registration", "Event", "eventId", "User", "studentId", "Attendance", "registrationId", "createdAt"
* **Execution Verification**: Query executed successfully against the live PostgreSQL `eventflow` database.
