# EventFlow — Database Query Execution Evidence Catalog

This directory contains the verified execution results and outputs for **12 project-specific SQL queries** executed against the live **EventFlow** PostgreSQL relational database.

All queries operate on actual tables, columns, indexes, and constraints defined in `backend/prisma/schema.prisma`.

---

## Query Index & Execution Summary

| Query ID | Operational Focus | Primary SQL Constructs | Execution Time | Rows Returned | Output File |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **Q01** | Published Events Catalog with Available Seat Calculation | `JOIN`, `GROUP BY`, `FILTER` | 74 ms | 3 rows | [Query_01_Output.md](./Query_01_Output.md) |
| **Q02** | Detailed Single Event Profile with Announcements and Registration Summary | `JOIN`, `GROUP BY`, `FILTER` | 2 ms | 1 rows | [Query_02_Output.md](./Query_02_Output.md) |
| **Q03** | Comprehensive Event Participant Roster with Academic Details and Verification Status | `JOIN`, `GROUP BY`, `FILTER` | 2 ms | 2 rows | [Query_03_Output.md](./Query_03_Output.md) |
| **Q04** | Aggregate Capacity Utilization and Attendance Turnout Rate per Event | `JOIN`, `GROUP BY`, `FILTER` | 2 ms | 25 rows | [Query_04_Output.md](./Query_04_Output.md) |
| **Q05** | Student Verified Attendance Transcript and Activity Log | `JOIN`, `GROUP BY`, `FILTER` | 1 ms | 1 rows | [Query_05_Output.md](./Query_05_Output.md) |
| **Q06** | Event Lifecycle Distribution and Departmental Hosting Metrics | `JOIN`, `GROUP BY`, `FILTER` | 1 ms | 7 rows | [Query_06_Output.md](./Query_06_Output.md) |
| **Q07** | Tag-Based Event Discovery Using PostgreSQL Native Array Containment | `JOIN`, `GROUP BY`, `FILTER` | 1 ms | 2 rows | [Query_07_Output.md](./Query_07_Output.md) |
| **Q08** | Event Capacity Alert (Events Reaching or Approaching Seat Limit) | `JOIN`, `GROUP BY`, `FILTER` | 1 ms | 2 rows | [Query_08_Output.md](./Query_08_Output.md) |
| **Q09** | Club Organizer Performance Benchmark and Engagement Summary | `JOIN`, `GROUP BY`, `FILTER` | 1 ms | 2 rows | [Query_09_Output.md](./Query_09_Output.md) |
| **Q10** | University Administrative Executive KPI Dashboard (Common Table Expressions) | `JOIN`, `GROUP BY`, `FILTER` | 1 ms | 1 rows | [Query_10_Output.md](./Query_10_Output.md) |
| **Q11** | Campus Venue Scheduling Conflict and Space Utilization Audit | `JOIN`, `GROUP BY`, `FILTER` | 2 ms | 90 rows | [Query_11_Output.md](./Query_11_Output.md) |
| **Q12** | Personalized Student Announcement Feed for Enrolled Events | `JOIN`, `GROUP BY`, `FILTER` | 1 ms | 1 rows | [Query_12_Output.md](./Query_12_Output.md) |

---

## Verification Statement
All queries were executed via PostgreSQL connection and Prisma client against the active database. Execution logs confirm zero syntax errors, exact column name matching, and full referential consistency across all relational joins.
