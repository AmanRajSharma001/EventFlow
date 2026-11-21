# EventFlow — Data Integrity & Database Performance Analysis

This document provides an engineering evaluation of the **data integrity safeguards**, **concurrency control mechanisms**, **indexing architecture**, and **performance characteristics** of the **EventFlow** PostgreSQL database.

---

## 1. Data Integrity Mechanisms

EventFlow implements a defense-in-depth integrity model across four fundamental database dimensions:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EVENTFLOW INTEGRITY ARCHITECTURE                      │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ 1. ENTITY INTEGRITY           │ UUID v4 Primary Keys on all 5 tables        │
│ 2. DOMAIN INTEGRITY           │ PostgreSQL Enums (`Role`, `EventStatus`,    │
│                               │ `RegistrationStatus`) & NOT NULL rules      │
│ 3. REFERENTIAL INTEGRITY      │ Foreign Keys with RESTRICT / CASCADE rules   │
│ 4. USER-DEFINED INTEGRITY     │ Unique email, QR token, and composite keys  │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

### 1.1 Entity Integrity
Every table in EventFlow utilizes an immutable, collision-resistant Universally Unique Identifier (**UUID v4**) as its primary key:
* `User.id`: `TEXT PRIMARY KEY` (`User_pkey`)
* `Event.id`: `TEXT PRIMARY KEY` (`Event_pkey`)
* `Registration.id`: `TEXT PRIMARY KEY` (`Registration_pkey`)
* `Attendance.id`: `TEXT PRIMARY KEY` (`Attendance_pkey`)
* `Announcement.id`: `TEXT PRIMARY KEY` (`Announcement_pkey`)

Unlike sequential 32-bit auto-incrementing integers, UUIDs prevent horizontal enumeration attacks (where an unauthorized actor accesses another student's ticket by guessing ID `1042`), support distributed ID generation, and guarantee global uniqueness across staging, desktop, and cloud environments.

---

### 1.2 Domain Integrity & Type Enforcement
EventFlow guarantees that attributes only store valid, sanitized values through database-level type constraints:
1. **Custom Enumerations**:
   - `Role`: Strictly restricted to `'STUDENT'`, `'ORGANIZER'`, `'ADMIN'`.
   - `EventStatus`: Restricted to `'DRAFT'`, `'PUBLISHED'`, `'CANCELLED'`, `'COMPLETED'`.
   - `RegistrationStatus`: Restricted to `'CONFIRMED'`, `'CANCELLED'`.
2. **Mandatory Attributes (`NOT NULL`)**:
   - Critical business fields (e.g., `Event.title`, `Event.capacity`, `Event.startDate`, `User.name`, `User.email`, `User.password`) reject `NULL` insertions at the database engine level.
3. **Application-Layer Validation (Zod Schemas)**:
   - Before any SQL is generated, incoming HTTP requests pass through Zod validators (`backend/src/validators/auth.validator.js`, `event.validator.js`). Zod validates email formatting, string lengths, positive integer capacities, and ISO 8601 timestamps, rejecting invalid payloads before they reach PostgreSQL.

---

### 1.3 Referential Integrity & Foreign Key Actions
Relationships between entities are protected by strict foreign key constraints defined in PostgreSQL. The table below outlines the referential actions and their business justifications:

| Constraint Symbol | Originating Table | Foreign Key | Referenced Table | `ON DELETE` Action | Architectural Rationale |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `Event_organizerId_fkey` | `Event` | `organizerId` | `User(id)` | **`RESTRICT`** | Prevents accidental deletion of a faculty or organizer account while active university events are registered under their name. |
| `Registration_studentId_fkey` | `Registration` | `studentId` | `User(id)` | **`RESTRICT`** | Preserves student academic records; student accounts cannot be dropped while linked to attendance tickets. |
| `Registration_eventId_fkey` | `Registration` | `eventId` | `Event(id)` | **`RESTRICT`** | Prevents deletion of an event that has active student registrations. |
| `Attendance_registrationId_fkey` | `Attendance` | `registrationId` | `Registration(id)` | **`CASCADE`** | If a registration ticket is formally purged, its corresponding physical check-in record is automatically cleaned up. |
| `Announcement_eventId_fkey` | `Announcement` | `eventId` | `Event(id)` | **`CASCADE`** | Deleting an event safely removes all associated event-specific notices and room change alerts. |
| `Announcement_creatorId_fkey` | `Announcement` | `creatorId` | `User(id)` | **`RESTRICT`** | Protects the audit trail of who authored campus announcements. |

---

### 1.4 User-Defined Constraints & Uniqueness Guarantees
To prevent duplicate accounts and duplicate event enrollments, EventFlow enforces four critical unique constraints:

1. **`User_email_key`**:
   `CONSTRAINT "User_email_key" UNIQUE ("email")`
   Guarantees that an institutional email can only be registered once.
2. **`Registration_studentId_eventId_key`**:
   `CONSTRAINT "Registration_studentId_eventId_key" UNIQUE ("studentId", "eventId")`
   Prevents a student from holding multiple simultaneous registration records for the same campus event.
3. **`Registration_qrToken_key`**:
   `CONSTRAINT "Registration_qrToken_key" UNIQUE ("qrToken")`
   Guarantees that each issued digital entrance pass has a distinct cryptographic check-in token.
4. **`Attendance_registrationId_key`**:
   `CONSTRAINT "Attendance_registrationId_key" UNIQUE ("registrationId")`
   Enforces a strict **1:1 relationship** between a registration ticket and its venue check-in. Once a ticket has been scanned, any subsequent scan attempt is rejected by the database.

---

## 2. Concurrency Control & ACID Transaction Analysis

### 2.1 The Ticket Overselling Race Condition
In campus event platforms, high-demand workshops (such as hackathons or technical bootcamps with limited 50-seat capacities) face severe concurrency spikes. If two students submit a registration simultaneously when only 1 seat remains:

```
[ Thread A: Student 1 ]                     [ Thread B: Student 2 ]
       │                                           │
       ├── Reads Capacity (50) & Count (49)        │
       │   Remaining: 1 seat                       │
       │                                           ├── Reads Capacity (50) & Count (49)
       │                                           │   Remaining: 1 seat
       ├── Inserts Registration (Count becomes 50) │
       │                                           ├── Inserts Registration (Count becomes 51) ❌ OVERBOOKED!
```

Under default `Read Committed` isolation, both transactions read the count before either has committed, resulting in capacity violation.

### 2.2 EventFlow's Serializable Isolation Solution
EventFlow solves this in `backend/src/controllers/registration.controller.js` by executing the capacity check and registration inside an interactive Prisma transaction pinned to **`Serializable`** isolation:

```javascript
const result = await prisma.$transaction(async (tx) => {
  const event = await tx.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: { registrations: { where: { status: "CONFIRMED" } } }
      }
    }
  });

  if (event._count.registrations >= event.capacity) {
    const err = new Error("This event has reached full capacity");
    err.statusCode = 400;
    throw err;
  }

  return await tx.registration.create({
    data: { eventId, studentId, status: "CONFIRMED" }
  });
}, { isolationLevel: "Serializable" });
```

### 2.3 Serialization Anomaly Prevention & `P2034` Handling
Under `Serializable` isolation, PostgreSQL's Predicate Locking engine tracks read and write dependencies. When two concurrent transactions read the same registration count and attempt to insert, PostgreSQL detects a serialization anomaly and automatically aborts the second transaction with error `40001` (`serialization_failure`).

The EventFlow backend intercepts this via Prisma error code **`P2034`**:

```javascript
catch (error) {
  if (error?.code === "P2034") {
    return res.status(409).json({
      success: false,
      message: "Could not complete registration due to high concurrent demand, please try again"
    });
  }
}
```

This guarantees that the venue capacity constraint is never violated, preserving ACID consistency.

---

## 3. Current Indexing Strategy & Query Performance

### 3.1 Existing Index Catalog
PostgreSQL maintains 9 active B-Tree indexes on the EventFlow public schema:

| Table | Index Name | Index Type | Indexed Column(s) | Operational Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`User`** | `User_pkey` | UNIQUE B-TREE | `("id")` | $O(\log N)$ primary key record lookups. |
| **`User`** | `User_email_key` | UNIQUE B-TREE | `("email")` | Fast authentication credential lookups. |
| **`Event`** | `Event_pkey` | UNIQUE B-TREE | `("id")` | Fast single-event profile retrieval. |
| **`Registration`** | `Registration_pkey` | UNIQUE B-TREE | `("id")` | Ticket identification lookups. |
| **`Registration`** | `Registration_qrToken_key` | UNIQUE B-TREE | `("qrToken")` | Instant $O(1)$ ticket verification at venue gates. |
| **`Registration`** | `Registration_studentId_eventId_key` | UNIQUE B-TREE | `("studentId", "eventId")` | Duplicate registration prevention index. |
| **`Attendance`** | `Attendance_pkey` | UNIQUE B-TREE | `("id")` | Attendance record lookup. |
| **`Attendance`** | `Attendance_registrationId_key` | UNIQUE B-TREE | `("registrationId")` | Prevents multiple check-in scans for a single ticket. |
| **`Announcement`** | `Announcement_pkey` | UNIQUE B-TREE | `("id")` | Announcement lookup. |

---

### 3.2 Live Execution Plan Analysis (`EXPLAIN ANALYZE`)
The following execution plan was captured by executing `EXPLAIN ANALYZE` on the catalog query (Query 01) against the live PostgreSQL `eventflow` database:

```text
GroupAggregate  (cost=7.45..7.51 rows=3 width=83) (actual time=0.087..0.093 rows=3 loops=1)
  Group Key: e.id
  Buffers: shared hit=10
  ->  Sort  (cost=7.45..7.46 rows=3 width=116) (actual time=0.079..0.081 rows=4 loops=1)
        Sort Key: e.id
        Sort Method: quicksort  Memory: 25kB
        Buffers: shared hit=10
        ->  Hash Left Join  (cost=1.09..7.43 rows=3 width=116) (actual time=0.035..0.058 rows=4 loops=1)
              Hash Cond: (e.id = r."eventId")
              Buffers: shared hit=7
              ->  Seq Scan on "Event" e  (cost=0.00..6.31 rows=3 width=75) (actual time=0.014..0.035 rows=3 loops=1)
                    Filter: (status = 'PUBLISHED'::"EventStatus")
                    Rows Removed by Filter: 22
                    Buffers: shared hit=6
              ->  Hash  (cost=1.04..1.04 rows=4 width=78) (actual time=0.013..0.013 rows=4 loops=1)
                    Buckets: 1024  Batches: 1  Memory Usage: 9kB
                    Buffers: shared hit=1
                    ->  Seq Scan on "Registration" r  (cost=0.00..1.04 rows=4 width=78) (actual time=0.006..0.007 rows=4 loops=1)
                          Buffers: shared hit=1
Planning Time: 0.901 ms
Execution Time: 0.166 ms
```

#### Plan Insights:
1. **Quicksort & Hash Left Join**: The optimizer builds a hash table of registrations (`Memory Usage: 9kB`) and probes it against published events in **0.166 ms**.
2. **Buffer Hit Ratio**: All 10 shared buffer hits occurred in memory (`shared hit=10`), with 0 disk reads.
3. **Filter Removal**: The sequential scan on `"Event"` evaluated 25 rows and removed 22 draft/completed events via the filter `status = 'PUBLISHED'`. At current demo scale (<1,000 events), sequential scans are faster than index lookups because sequential page reads require no random I/O. However, as the event catalog scales, adding targeted indexes becomes beneficial.

---

## 4. Potential Performance Improvements (Future Optimization Roadmap)

> [!NOTE]
> The recommendations below represent proposed scaling optimizations for production-grade high-volume deployments. They are clearly separated from the existing implementation.

### 4.1 Composite Index on Event Status and Chronological Date
* **Proposed DDL**:
  ```sql
  CREATE INDEX "idx_event_status_startdate" ON "Event"("status", "startDate" ASC);
  ```
* **Performance Gain**:
  Currently, querying published events requires a table filter scan. A composite B-tree index on `(status, startDate)` allows PostgreSQL to perform an **Index Scan** directly returning published events in pre-sorted chronological order, eliminating both the filter step and the `Sort Key: e.id` memory sort.

---

### 4.2 Foreign Key Indexing on Registration
* **Proposed DDL**:
  ```sql
  CREATE INDEX "idx_registration_event_status" ON "Registration"("eventId", "status");
  ```
* **Performance Gain**:
  While `Registration` has a composite unique constraint on `(studentId, eventId)`, queries that calculate event capacity (`WHERE "eventId" = $1 AND "status" = 'CONFIRMED'`) cannot effectively use the `studentId`-leading composite key. An index leading with `eventId` converts the `Hash Left Join` into an efficient **Index Only Scan**.

---

### 4.3 Generalized Inverted Index (GIN) on Array Tags
* **Proposed DDL**:
  ```sql
  CREATE INDEX "idx_event_tags_gin" ON "Event" USING GIN ("tags");
  ```
* **Performance Gain**:
  Standard B-Tree indexes cannot index the individual elements of a PostgreSQL `TEXT[]` array. Adding a **GIN index** accelerates array overlap (`&&`) and containment (`@>`) queries (Query 07) from $O(N)$ sequential scans to $O(1)$ inverted index lookups.

---

### 4.4 Functional Index for Case-Insensitive Credential Lookup
* **Proposed DDL**:
  ```sql
  CREATE INDEX "idx_user_email_lower" ON "User" (LOWER("email"));
  CREATE INDEX "idx_user_rollnumber_upper" ON "User" (UPPER("rollNumber"));
  ```
* **Performance Gain**:
  When users log in using insensitive mode (`{ mode: "insensitive" }`), PostgreSQL must evaluate `LOWER(email)` on each row. A functional index allows PostgreSQL to directly seek the pre-computed lowercase representation in logarithmic time.

---

### 4.5 In-Memory Caching (Redis) for Read-Heavy Discovery
* **Architecture**: Deploy a Redis cache fronting the public event catalog API (`GET /api/events`).
* **Cache Strategy**: Cache-aside with a 5-minute Time-To-Live (TTL). When an organizer publishes, edits, or cancels an event, the backend emits an invalidation key `events:published:*`.
* **Benefit**: Absorbs up to 90% of read traffic during peak campus fest announcements, insulating the primary PostgreSQL instance.
