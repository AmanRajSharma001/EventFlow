# EventFlow Query Execution Output: Query 05

## 1. Query Title & Operational Intent
**Student Verified Attendance Transcript and Activity Log**

* **Description**: Produces an institutional transcript of verified physical check-ins for students across university events for extracurricular credits and certificate generation.
* **Execution Timestamp**: 2026-11-21T17:57:20.488Z
* **Target Engine**: PostgreSQL (via Prisma ORM / pg adapter)
* **Execution Duration**: 1 ms
* **Rows Returned**: 1

---

## 2. SQL Query Source
```sql
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
```

---

## 3. Actual Tabular Execution Output

| student_name | student_email | roll_number | event_title | event_category | venue | event_date | verified_at | verification_method |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Student 1 | student1@eventflow.test | N/A | Chroma Lens: Annual Campus Photography Contest | Competitions | Exhibition Hall, Fine Arts Wing | 2026-11-04 13:54:40 | 2026-11-04 13:54:40 | QR_CODE_SCAN |


---

## 4. Query Analysis & Database Concepts
* **Tables Referenced**: "rollNumber", "startDate", "checkedInAt", "Attendance", "Registration", "registrationId", "User", "studentId", "Event", "eventId"
* **Execution Verification**: Query executed successfully against the live PostgreSQL `eventflow` database.
