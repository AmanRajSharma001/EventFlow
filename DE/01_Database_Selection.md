# EventFlow — Data Engineering Documentation
## Deliverable 01: Database Technology Selection & Architectural Justification

---

### Executive Summary

**EventFlow** is an integrated campus event management, student registration, and attendance verification platform. Designed for university environments, EventFlow serves multiple campus user roles—including **Students**, **Club/Faculty Organizers**, and **Central Administrators**—to facilitate the complete lifecycle of campus events from creation, capacity-limited registration, and QR ticket issuance to real-time venue check-in and attendance auditing.

To support these mission-critical requirements, **PostgreSQL** was selected as the core relational database management system (RDBMS), operated through **Prisma ORM 7** with the `@prisma/adapter-pg` driver. This document provides a rigorous architectural justification for this database selection based on the operational realities and technical implementation of EventFlow.

---

### 1. Requirements Analysis for EventFlow

A database backing a university event management platform must satisfy several strict technical demands:

1. **Strict Relational Integrity**: The domain model is inherently relational. An Event is organized by a User (Organizer); Registrations act as associative entities connecting Students and Events; Attendance is tied one-to-one with a verified Registration; and Announcements belong to an Event authored by a privileged User. Any referential gap (e.g., an orphaned registration or ticket) invalidates campus security and event safety.
2. **ACID Transaction Guarantees & Concurrency Control**: High-demand campus hackathons, fests, and workshops have hard physical capacity limits (e.g., 300 auditorium seats). When registration opens, hundreds of students concurrently attempt to secure remaining seats. The database must prevent race conditions, overbooking, and phantom reads through robust transactional isolation.
3. **Compound Uniqueness & Business Constraints**: A student must never be allowed to register twice for the same event (enforced by composite unique constraint `[studentId, eventId]`). Similarly, ticket verification QR tokens (`qrToken`) and user emails (`email`) must be globally unique across the system.
4. **Data Durability & Auditability**: Event attendance records provide official academic proof of student participation. Once an attendee checks in at the venue, that verification timestamp (`checkedInAt`) must be durably stored and protected against accidental overwriting or double check-in.
5. **Multi-Deployment Mode Support**: EventFlow is built to operate seamlessly across three deployment architectures:
   - **Mode A (Connected Website)**: Remote web browser connecting to a centralized cloud-hosted Express API and managed PostgreSQL database.
   - **Mode B (Independent Local Development)**: Developers running frontend and backend independently against local PostgreSQL.
   - **Mode C (Standalone Electron Desktop Application)**: Campus workstations and registration desks running a packaged macOS desktop app with an embedded backend connecting securely to PostgreSQL.

---

### 2. Why PostgreSQL is Used in EventFlow

PostgreSQL is an open-source, enterprise-grade object-relational database management system with over 35 years of active development. It was chosen as the primary data store for EventFlow due to the following specific architectural strengths:

#### 2.1 Multi-Version Concurrency Control (MVCC) & Isolation Levels
PostgreSQL implements MVCC, allowing concurrent transactions to read and write without locking entire tables. In EventFlow, when students submit concurrent seat reservations:
- Read operations (such as browsing upcoming event listings) never block write operations (such as booking a ticket).
- Write operations never block concurrent reads.
- Crucially, PostgreSQL supports **Serializable Isolation** (`SERIALIZABLE`), which EventFlow utilizes in `backend/src/controllers/registration.controller.js`. When checking capacity and inserting a registration row inside `prisma.$transaction(..., { isolationLevel: "Serializable" })`, PostgreSQL detects concurrent serialization anomalies and automatically rejects conflicting transactions, mathematically guaranteeing that event capacity is never exceeded.

#### 2.2 Comprehensive Declarative Constraint Enforcement
PostgreSQL enforces integrity constraints at the database engine level rather than relying solely on application-level code:
- **Foreign Key Constraints (`REFERENCES`)**: Enforces parent-child relationships with configurable referential actions (`ON DELETE RESTRICT` for users with events/registrations, `ON DELETE CASCADE` for registrations deleting child attendance records).
- **Unique Constraints (`UNIQUE`)**: Native B-tree backed unique indexes on `email`, `qrToken`, `registrationId`, and the composite key `(studentId, eventId)`.
- **Not Null Constraints (`NOT NULL`)**: Guarantees mandatory attributes are always populated before write commits.

#### 2.3 Rich Native Data Types
EventFlow leverages PostgreSQL’s rich type system:
- **UUID (`TEXT` / `uuid`)**: Universally unique identifiers used as primary keys across all tables, avoiding sequential ID enumeration vulnerabilities and enabling client-side ID pre-generation without collision risks.
- **Timestamp with Precision (`TIMESTAMP(3)`)**: Millisecond-accurate event schedules, registration creation timestamps, and venue check-in times.
- **Native Array Types (`TEXT[]`)**: PostgreSQL natively supports array columns (`tags TEXT[]` on the `Event` table), enabling fast tag filtering without requiring multiple query joins for simple label filtering.
- **Native Enumerations (`CREATE TYPE ... AS ENUM`)**: Custom schema-level enums (`Role`: `STUDENT`, `ORGANIZER`, `ADMIN`; `EventStatus`: `DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED`; `RegistrationStatus`: `CONFIRMED`, `CANCELLED`) ensure data validity directly at the storage engine level.

---

### 3. Relational vs. Non-Relational (NoSQL) Comparative Analysis

During initial project planning, alternative database architectures—particularly Document Stores (MongoDB) and Embedded Relational Databases (SQLite)—were evaluated. The table below summarizes why PostgreSQL was ultimately selected for EventFlow:

| Evaluation Criterion | PostgreSQL (Selected) | MongoDB (Document Store) | SQLite (Embedded File) |
| :--- | :--- | :--- | :--- |
| **Data Model Paradigm** | Object-Relational (Tables, Rows, Foreign Keys) | Document-Oriented (JSON/BSON Collections) | Relational (Single local file) |
| **Referential Integrity** | Engine-enforced FK constraints with CASCADE/RESTRICT | Application-enforced; no native cross-collection FK constraints | Supported, but disabled by default; limited alter table migrations |
| **Concurrency & Locking** | Row-level locking with full MVCC; multi-client concurrency | Document-level locking; cross-document transactions add overhead | Database-level / table-level lock on write; poor multi-user concurrency |
| **Isolation Levels** | Read Committed, Repeatable Read, Serializable | Snapshot isolation across replica sets | Read Uncommitted, Serialized (locks entire database file) |
| **Handling Capacity Races** | First-class Serializable isolation transactions | Vulnerable to race conditions without distributed transaction locks | Locks database file, creating bottlenecks under concurrent requests |
| **Array & Structured Fields** | Native array type (`TEXT[]`) with `@>` containment operators | Native embedded arrays | JSON strings or text serialization |
| **Desktop / Server Flexibility** | Connects over TCP socket from local or remote hosts | Heavy background daemon; difficult to bundle cleanly in desktop apps | Excellent for local file, but cannot support remote multi-user server mode |
| **Ecosystem & Prisma Support** | Mature, robust Prisma 7 integration via `@prisma/adapter-pg` | Prisma support exists, but lacks relational migration workflows | Does not support enums, arrays, or enterprise scaling |

#### Why NoSQL (MongoDB) Was Inadequate for EventFlow
In an event management platform, student registrations inherently link two distinct master records: a `User` and an `Event`. In a document store like MongoDB:
1. **Denormalization vs. Normalization Dilemma**: If event details are duplicated inside each student's registration document, updating an event's time or venue requires updating thousands of subdocuments, creating severe write amplification and data inconsistency risks.
2. **Lack of Referential Restraints**: If an organizer account is deleted in MongoDB, existing events and registrations could be left in an orphaned state unless complex, fragile application-tier cleanup hooks are manually maintained.
3. **Overbooking Under Concurrency**: Managing strict seat capacity across concurrent requests in MongoDB without multi-document ACID transactions often leads to overbooking bugs during campus registration rushes.

---

### 4. Prisma ORM Integration with PostgreSQL

EventFlow employs **Prisma ORM 7** as the data access and modeling abstraction layer connecting the Express.js backend to PostgreSQL.

```
┌────────────────────────────────────────────────────────┐
│               Express.js REST Controllers              │
│       (auth, event, registration, attendance, etc.)    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Prisma ORM 7 Client                  │
│  - Type-safe Query Builder                             │
│  - Transaction Orchestrator ($transaction)             │
│  - Query Engine with `@prisma/adapter-pg`              │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   pg Connection Pool                   │
│              (PostgreSQL Node.js Driver)               │
└───────────────────────────┬────────────────────────────┘
                            │ (TCP Socket Port 5432)
                            ▼
┌────────────────────────────────────────────────────────┐
│               PostgreSQL Database Engine               │
│   [User] ──< [Registration] >── [Event] ──< [Announce] │
│                      │                                 │
│                 [Attendance]                           │
└────────────────────────────────────────────────────────┘
```

#### Key Benefits of the Prisma + PostgreSQL Stack:
1. **Declarative Schema as Single Source of Truth (`schema.prisma`)**:
   All database tables, relations, indexes, and enums are defined in one centralized file. Any change to the schema automatically generates corresponding PostgreSQL migrations and updates the client types.
2. **Version-Controlled SQL Migrations (`prisma/migrations`)**:
   Database evolution is managed through deterministic, committed SQL migration scripts (`20261113055530_init`, `20261113205932_add_student_profile_fields`, etc.). Teammates and automated test environments can reliably recreate identical database schemas without manual DDL intervention.
3. **Prisma Driver Adapter (`@prisma/adapter-pg`)**:
   EventFlow utilizes Prisma's modern driver adapter architecture (`@prisma/adapter-pg`), decoupling query compilation from connection pooling. This allows the application to reuse an optimized `pg.Pool` instance with configurable connection limits, idle timeouts, and graceful shutdown lifecycles.
4. **Desktop Packaging Resilience**:
   In the Electron desktop distribution (Mode C), the packaged Express backend automatically resolves connection parameters from secure local paths (e.g., `~/Library/Application Support/EventFlow/.env`), allowing the application to connect to the intended PostgreSQL instance without baking database credentials into the distributed DMG file.

---

### 5. Summary Conclusion

PostgreSQL provides the exact guarantees required for EventFlow: **strict relational constraints**, **rock-solid ACID transactions**, **high-concurrency capacity safety**, and **rich relational querying capabilities**. Coupled with Prisma ORM 7, the database architecture satisfies all academic requirements for the Data Engineering integrated project while powering a robust, production-ready system.
