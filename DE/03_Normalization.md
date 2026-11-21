# EventFlow — Data Engineering Documentation
## Deliverable 03: Relational Database Normalization Analysis

---

### Executive Overview

Database normalization is a systematic relational design technique that organizes tables and attributes to minimize data redundancy, avoid anomalies during data manipulation (insert, update, delete), and preserve data integrity through functional dependencies.

This document presents a rigorous academic normalization audit of the **EventFlow** database schema across:
- **First Normal Form (1NF)**
- **Second Normal Form (2NF)**
- **Third Normal Form (3NF)**
- **Boyce-Codd Normal Form (BCNF)**

The analysis is based strictly on the production PostgreSQL schema defined in `backend/prisma/schema.prisma` and executed via migration scripts in `backend/prisma/migrations/`.

---

### 1. Functional Dependency (FD) Formalization

To evaluate normalization levels objectively, we first identify the formal Functional Dependencies (FDs) and Candidate Keys for each of the five core relations in EventFlow.

#### 1.1 Relation: `User`
* **Attributes**: `{ id, name, email, password, role, rollNumber, department, semester, phone, createdAt, updatedAt }`
* **Candidate Keys**:
  - $CK_1 = \{ \text{id} \}$ (Surrogate Primary Key, UUID)
  - $CK_2 = \{ \text{email} \}$ (Natural Key, enforced by `@unique`)
* **Functional Dependencies**:
  - $FD_1: \text{id} \rightarrow \{ \text{name, email, password, role, rollNumber, department, semester, phone, createdAt, updatedAt} \}$
  - $FD_2: \text{email} \rightarrow \{ \text{id, name, password, role, rollNumber, department, semester, phone, createdAt, updatedAt} \}$

#### 1.2 Relation: `Event`
* **Attributes**: `{ id, title, description, location, category, imageUrl, department, coordinator, featured, price, tags, startDate, endDate, registrationDeadline, publishedAt, capacity, status, organizerId, createdAt, updatedAt }`
* **Candidate Key**:
  - $CK_1 = \{ \text{id} \}$ (Primary Key, UUID)
* **Functional Dependencies**:
  - $FD_1: \text{id} \rightarrow \{ \text{title, description, location, category, imageUrl, department, coordinator, featured, price, tags, startDate, endDate, registrationDeadline, publishedAt, capacity, status, organizerId, createdAt, updatedAt} \}$
  - Note: `organizerId` is a foreign key referencing `User(id)`.

#### 1.3 Relation: `Registration`
* **Attributes**: `{ id, studentId, eventId, qrToken, status, notes, department, semester, cancellationReason, cancelledAt, createdAt }`
* **Candidate Keys**:
  - $CK_1 = \{ \text{id} \}$ (Primary Key, UUID)
  - $CK_2 = \{ \text{studentId, eventId} \}$ (Composite Candidate Key, enforced by `@@unique([studentId, eventId])`)
  - $CK_3 = \{ \text{qrToken} \}$ (Unique Ticket Token, enforced by `@unique`)
* **Functional Dependencies**:
  - $FD_1: \text{id} \rightarrow \{ \text{studentId, eventId, qrToken, status, notes, department, semester, cancellationReason, cancelledAt, createdAt} \}$
  - $FD_2: \{ \text{studentId, eventId} \} \rightarrow \{ \text{id, qrToken, status, notes, department, semester, cancellationReason, cancelledAt, createdAt} \}$
  - $FD_3: \text{qrToken} \rightarrow \{ \text{id, studentId, eventId, status, notes, department, semester, cancellationReason, cancelledAt, createdAt} \}$

#### 1.4 Relation: `Attendance`
* **Attributes**: `{ id, registrationId, checkedInAt }`
* **Candidate Keys**:
  - $CK_1 = \{ \text{id} \}$ (Primary Key, UUID)
  - $CK_2 = \{ \text{registrationId} \}$ (Foreign Key, enforced 1:1 by `@unique`)
* **Functional Dependencies**:
  - $FD_1: \text{id} \rightarrow \{ \text{registrationId, checkedInAt} \}$
  - $FD_2: \text{registrationId} \rightarrow \{ \text{id, checkedInAt} \}$

#### 1.5 Relation: `Announcement`
* **Attributes**: `{ id, eventId, creatorId, title, message, createdAt, updatedAt }`
* **Candidate Key**:
  - $CK_1 = \{ \text{id} \}$ (Primary Key, UUID)
* **Functional Dependencies**:
  - $FD_1: \text{id} \rightarrow \{ \text{eventId, creatorId, title, message, createdAt, updatedAt} \}$

---

### 2. First Normal Form (1NF) Analysis

#### Criteria for 1NF
A relation $R$ is in First Normal Form if and only if:
1. Each column contains only atomic (indivisible, single-valued) values.
2. There are no repeating groups or repeating columns for identical attribute sets.
3. Every row is uniquely identifiable by a defined Primary Key.
4. All attribute values belong to the defined domain of that column.

#### Evaluation of EventFlow Relations:
* **`User`**: Fully satisfies 1NF. Every attribute (`name`, `email`, `role`, `rollNumber`, etc.) stores an atomic scalar value.
* **`Registration`**: Fully satisfies 1NF. Single-valued scalar values; primary key `id` uniquely identifies each enrollment.
* **`Attendance`**: Fully satisfies 1NF. Contains scalar UUID and timestamp.
* **`Announcement`**: Fully satisfies 1NF. Contains scalar strings, UUIDs, and timestamps.

#### Honest Critical Evaluation: `Event.tags` Limitation
* **The Structural Observation**: In `backend/prisma/schema.prisma` line 109, the `Event` entity includes:
  ```prisma
  tags String[] @default([])
  ```
  In PostgreSQL, this is realized as `tags TEXT[] DEFAULT ARRAY[]::TEXT[]`.
* **Theoretical Relational Violation**:
  In classical relational database theory (E.F. Codd), an attribute containing an array of multiple elements (e.g., `["Hackathon", "AI & ML", "Coding"]`) is **non-atomic**, strictly violating pure First Normal Form.
* **Engineering Justification for Pragmatic Denormalization**:
  PostgreSQL natively supports array types with indexed containment operators (such as `@>`), allowing fast tag-based UI chips without incurring the join overhead of two additional tables (`Tag` and `EventTag`).
* **Ideal Normalized Relational Equivalent**:
  To achieve academic, purist 1NF compliance, the array would be decomposed into a normalized junction relation:
  ```sql
  CREATE TABLE "Tag" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT UNIQUE NOT NULL
  );

  CREATE TABLE "EventTag" (
      "eventId" TEXT NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
      "tagId" TEXT NOT NULL REFERENCES "Tag"("id") ON DELETE CASCADE,
      PRIMARY KEY ("eventId", "tagId")
  );
  ```
* **Documentation Finding**: We record this explicitly as a conscious, pragmatic hybrid design decision in EventFlow. The remainder of the schema strictly adheres to 1NF.

---

### 3. Second Normal Form (2NF) Analysis

#### Criteria for 2NF
A relation $R$ is in Second Normal Form if and only if:
1. It is in First Normal Form (1NF).
2. No non-prime attribute is partially dependent on any candidate key of $R$.
   *(A partial dependency exists if a non-prime attribute depends on a proper subset of a composite candidate key: $X \subset CK \text{ and } X \rightarrow A$).*

#### Evaluation:
1. **Relations with Single-Attribute Candidate Keys (`User`, `Event`, `Attendance`, `Announcement`)**:
   - For all four tables, the primary candidate keys consist of a single attribute (`id`).
   - A single-attribute key has no proper non-empty subsets.
   - Therefore, partial dependency is mathematically impossible.
   - **Conclusion**: `User`, `Event`, `Attendance`, and `Announcement` trivially satisfy 2NF.

2. **Relation with Composite Candidate Key (`Registration`)**:
   - `Registration` has a composite candidate key: $CK_2 = \{ \text{studentId, eventId} \}$.
   - Non-prime attributes: `{ qrToken, status, notes, department, semester, cancellationReason, cancelledAt, createdAt }`.
   - **Dependency Inspection**:
     - Does `status` depend on `studentId` alone? No. A student can have multiple registrations with different statuses across different events.
     - Does `status` depend on `eventId` alone? No. An event has many registrations with differing individual statuses.
     - Does `qrToken` depend on only one of the IDs? No. The ticket pass represents the unique intersection of a specific student booking a specific event.
     - What about `department` and `semester` in `Registration`? In EventFlow, these represent academic details recorded *at the time of the event registration* (a historical point-in-time snapshot, useful if a student changes semester between events). They depend on the event registration instance, not just `studentId`.
   - **Conclusion**: Every non-prime attribute functionally depends on the whole composite key $\{ \text{studentId, eventId} \}$. **`Registration` strictly satisfies 2NF.**

---

### 4. Third Normal Form (3NF) Analysis

#### Criteria for 3NF
A relation $R$ is in Third Normal Form if and only if:
1. It is in Second Normal Form (2NF).
2. No non-prime attribute is transitively dependent on any candidate key.
   *(A transitive dependency exists if $X \rightarrow Y$ and $Y \rightarrow Z$, where $X$ is a candidate key, $Y$ is not a candidate key, and $Z$ is a non-prime attribute not functionally determining $X$).*

#### Table-by-Table 3NF Audit:

#### 4.1 Table: `User`
* Candidate Keys: `id`, `email`.
* Non-prime attributes: `name`, `password`, `role`, `rollNumber`, `department`, `semester`, `phone`, `createdAt`, `updatedAt`.
* Dependencies:
  - $\text{id} \rightarrow \text{name}, \text{role}, \text{department}, \text{phone}, \dots$
  - $\text{email} \rightarrow \text{name}, \text{role}, \text{department}, \text{phone}, \dots$
* Are there transitive dependencies like $\text{department} \rightarrow \text{something}$?
  - No. `department` does not determine `semester`, `phone`, or `name`.
* **Verdict**: `User` is in **3NF**.

#### 4.2 Table: `Event`
* Candidate Key: `id`.
* Non-prime attributes: `title`, `description`, `location`, `category`, `imageUrl`, `department`, `coordinator`, `featured`, `price`, `tags`, `startDate`, `endDate`, `registrationDeadline`, `publishedAt`, `capacity`, `status`, `organizerId`, `createdAt`, `updatedAt`.
* Foreign Key: `organizerId` references `User(id)`.
* Anomaly Check: Does `Event` store organizer details (such as organizer name, email, or department)?
  - **No.** The organizer's personal attributes are stored only in the `User` table.
  - When the frontend displays the organizer's identity, the Express controller performs a relational join (`include: { organizer: { select: { name: true, email: true } } }`).
  - Storing organizer details directly in `Event` would have introduced a transitive dependency: $\text{Event.id} \rightarrow \text{organizerId} \rightarrow \text{organizerName}$, creating update anomalies. By separating them, EventFlow preserves 3NF.
* **Verdict**: `Event` is in **3NF**.

#### 4.3 Table: `Registration`
* Candidate Keys: `id`, `(studentId, eventId)`, `qrToken`.
* Non-prime attributes: `status`, `notes`, `department`, `semester`, `cancellationReason`, `cancelledAt`, `createdAt`.
* Anomaly Check: Are event attributes (e.g., `eventTitle`, `eventDate`, `location`) stored inside `Registration`?
  - **No.** If an event date changes, only one row in `Event` is updated. No rows in `Registration` need updating.
* Are student attributes (e.g., `studentName`, `studentEmail`) stored inside `Registration`?
  - **No.** Student profile data is linked via `studentId`.
* **Verdict**: `Registration` is in **3NF**.

#### 4.4 Table: `Attendance`
* Candidate Keys: `id`, `registrationId`.
* Non-prime attribute: `checkedInAt`.
* Dependencies:
  - $\text{id} \rightarrow \{ \text{registrationId, checkedInAt} \}$
  - $\text{registrationId} \rightarrow \{ \text{id, checkedInAt} \}$
* Anomaly Check: Attendance contains only the foreign key and timestamp. No redundant ticket, event, or student data is present.
* **Verdict**: `Attendance` is in **3NF**.

#### 4.5 Table: `Announcement`
* Candidate Key: `id`.
* Non-prime attributes: `eventId`, `creatorId`, `title`, `message`, `createdAt`, `updatedAt`.
* Foreign Keys: `eventId` references `Event(id)`, `creatorId` references `User(id)`.
* No non-key attributes determine other non-key attributes.
* **Verdict**: `Announcement` is in **3NF**.

---

### 5. Boyce-Codd Normal Form (BCNF) Assessment

#### Criteria for BCNF
A relation $R$ is in Boyce-Codd Normal Form (a stricter version of 3NF) if and only if for every non-trivial functional dependency $X \rightarrow Y$, the determinant $X$ is a **Superkey** (a candidate key or superset thereof).

#### Evaluation of EventFlow:
* **`User`**: Determinants are `id` and `email`. Both are candidate keys. $\rightarrow$ **Satisfies BCNF.**
* **`Event`**: Determinant is `id`. It is the primary candidate key. $\rightarrow$ **Satisfies BCNF.**
* **`Registration`**:
  - Determinants: `id` (PK), `{studentId, eventId}` (Composite CK), `qrToken` (Unique CK).
  - Since all three determinants are candidate keys, every functional dependency has a candidate key as its left-hand side.
  - $\rightarrow$ **Satisfies BCNF.**
* **`Attendance`**:
  - Determinants: `id` (PK) and `registrationId` (1:1 Unique Key). Both are candidate keys. $\rightarrow$ **Satisfies BCNF.**
* **`Announcement`**: Determinant is `id` (PK). $\rightarrow$ **Satisfies BCNF.**

---

### 6. Summary Normalization Compliance Matrix

| Table Name | Primary Key | Alternate / Candidate Keys | 1NF | 2NF | 3NF | BCNF | Normalization Notes |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **`User`** | `id` (UUID) | `email` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Fully normalized; no transitive dependencies. |
| **`Event`** | `id` (UUID) | None | ⚠️ Pragmatic | ✅ Yes | ✅ Yes | ✅ Yes | `tags` column uses PostgreSQL `TEXT[]` array for read speed; classically non-atomic, but engine-supported. |
| **`Registration`** | `id` (UUID) | `(studentId, eventId)`, `qrToken` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Associative junction table; full functional dependency on composite key. |
| **`Attendance`** | `id` (UUID) | `registrationId` | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Pure 1:1 check-in verification log; zero redundant attributes. |
| **`Announcement`** | `id` (UUID) | None | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Fully normalized event update feed. |

---

### 7. Conclusion

The EventFlow relational database adheres to high academic normalization standards:
1. **Absence of Redundancy**: Master records (`User`, `Event`) are never duplicated across transaction tables (`Registration`, `Attendance`).
2. **Protection Against Anomalies**:
   - **Insertion Anomaly Prevented**: An event can be created without requiring an existing attendee. A student can register an account without requiring immediate enrollment.
   - **Update Anomaly Prevented**: Updating an event's schedule or venue requires altering exactly one row in the `Event` table.
   - **Deletion Anomaly Prevented**: Deleting an event cascades cleanly to announcements and prevents orphaned attendance logs via referential actions.
3. **Honest Documentation of Design Choices**: The single departure from purist 1NF—the `tags TEXT[]` array in `Event`—is justified as a modern PostgreSQL performance optimization for campus category tags.
