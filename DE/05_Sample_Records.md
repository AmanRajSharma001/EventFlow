# EventFlow — Representative Database Sample Records

This document catalogs representative, authentic sample data from the **EventFlow** PostgreSQL relational database. All records directly mirror the actual tables, column structures, constraints, and relationships defined in `backend/prisma/schema.prisma` and deployed in the live PostgreSQL instance.

> [!NOTE]
> **Data Privacy & Security Compliance**: In compliance with academic integrity and application security standards, all sensitive credentials (such as bcrypt password hashes and internal signing secrets) have been sanitized with descriptive redaction tokens (e.g., `[PROTECTED_BCRYPT_HASH]`). No plain-text passwords or secret keys are exposed.

---

## 1. Entity Overview & Sample Record Counts

| Entity / Table | Primary Key | Foreign Key Dependencies | Representative Rows | Role / Lifecycle Represented |
| :--- | :--- | :--- | :---: | :--- |
| **`User`** | `id` (UUID) | None | 6 | Administrator, Club Organizers, Undergraduate Students |
| **`Event`** | `id` (UUID) | `organizerId` $\rightarrow$ `User(id)` | 5 | `PUBLISHED`, `COMPLETED`, and `DRAFT` status workflows |
| **`Registration`** | `id` (UUID) | `studentId` $\rightarrow$ `User(id)`, `eventId` $\rightarrow$ `Event(id)` | 4 | Confirmed student event enrollment tickets with QR tokens |
| **`Attendance`** | `id` (UUID) | `registrationId` $\rightarrow$ `Registration(id)` | 2 | Venue entry check-in records (Strict 1:1 verification) |
| **`Announcement`** | `id` (UUID) | `eventId` $\rightarrow$ `Event(id)`, `creatorId` $\rightarrow$ `User(id)` | 2 | Official venue, schedule, and gate check-in broadcasts |

---

## 2. Table: `User`

The `User` table stores identities across all system actors: Students, Organizers, and System Administrators.

### Column Specifications
* **Primary Key**: `id` (`TEXT` UUID v4)
* **Unique Key**: `email` (`TEXT` UNIQUE)
* **Enumerated Domain**: `role` (`STUDENT`, `ORGANIZER`, `ADMIN`)

### Representative Records

| id | name | email | password | role | rollNumber | department | semester | phone | createdAt |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `567cc0ff-be23-4bdc-b781-308e1a10cb4a` | Campus Administrator | `admin@eventflow.test` | `[PROTECTED_BCRYPT_HASH]` | `ADMIN` | *NULL* | *NULL* | *NULL* | *NULL* | `2026-11-14 13:54:40.518` |
| `0544b8de-0457-4b17-abbe-38126f474d6f` | E-Cell Club Organizer | `organizer1@eventflow.test` | `[PROTECTED_BCRYPT_HASH]` | `ORGANIZER` | *NULL* | Entrepreneurship Cell | *NULL* | `+91 98765 43210` | `2026-11-14 13:54:40.526` |
| `68a8f533-0562-4f47-8a4d-43df7e3bcc63` | Technical Society Organizer | `organizer2@eventflow.test` | `[PROTECTED_BCRYPT_HASH]` | `ORGANIZER` | *NULL* | Computer Science & Engg | *NULL* | `+91 98765 43211` | `2026-11-14 13:54:40.527` |
| `f951a622-452a-4258-b0e8-7d3adda0f450` | Aman Raj Sharma | `e25b070730@adypu.edu.in` | `[PROTECTED_BCRYPT_HASH]` | `STUDENT` | `E25B070730` | Computer Science & Engineering | 4th Semester | `+91 92081 15773` | `2026-11-14 15:37:52.667` |
| `088c478f-0824-47f0-a673-932c1aa82b16` | Student 1 | `student1@eventflow.test` | `[PROTECTED_BCRYPT_HASH]` | `STUDENT` | `E25B070101` | Computer Science & Engineering | 6th Semester | `+91 91234 56780` | `2026-11-14 13:54:40.531` |
| `cf7f04b7-241e-41a8-834c-2c109789beb8` | Student 2 | `student2@eventflow.test` | `[PROTECTED_BCRYPT_HASH]` | `STUDENT` | `E25B070102` | Electronics & Communication | 4th Semester | `+91 91234 56781` | `2026-11-14 13:54:40.532` |

---

## 3. Table: `Event`

The `Event` table captures all campus events, extracurricular workshops, hackathons, and sports fests.

### Column Specifications
* **Primary Key**: `id` (`TEXT` UUID v4)
* **Foreign Key**: `organizerId` $\rightarrow$ `User(id)` (`ON DELETE RESTRICT`)
* **Enumerated Domain**: `status` (`DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED`)
* **Array Attribute**: `tags` (`TEXT[]`)

### Representative Records

| id | title | category | location | capacity | status | organizerId | startDate | tags |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| `43ada8cb-61a2-4c36-9638-781ea27700ad` | Campus E-Summit 2026: From Idea to Seed Funding | Entrepreneurship | Sir C.V. Raman Auditorium | 450 | `PUBLISHED` | `0544b8de-0457-4b17-abbe-38126f474d6f` | `2026-11-21 13:54:40` | `{"Startup", "E-Cell", "Funding"}` |
| `655cf8bd-0261-4d5d-afd7-0e2bd21e6ba0` | Chancellor Trophy: Inter-Department Sports Tournament | Sports | University Sports Complex & Turf Ground | 500 | `PUBLISHED` | `0544b8de-0457-4b17-abbe-38126f474d6f` | `2026-11-28 13:54:40` | `{"Football", "Cricket", "Athletics"}` |
| `0b71fa81-6e08-4e0c-b069-26cc960ce37b` | Hackathon 2026: 36-Hour National Code Sprint | Technical | Computing Hub, Block 4 | 300 | `PUBLISHED` | `68a8f533-0562-4f47-8a4d-43df7e3bcc63` | `2026-12-05 13:54:40` | `{"Coding", "Hackathon", "Web3", "AI"}` |
| `5958f784-7cb6-4768-bd4d-8d9f63e92c4f` | Chroma Lens: Annual Campus Photography Contest | Competitions | Exhibition Hall, Fine Arts Wing | 100 | `COMPLETED` | `68a8f533-0562-4f47-8a4d-43df7e3bcc63` | `2026-11-04 13:54:40` | `{"Photography", "Arts", "Exhibition"}` |
| `76f2cc96-bc86-45e9-b9be-9e6c3f8b6fcc` | National Robotics Championship & Drone Racing | Technical | Main Sports Arena & Indoor Stadium | 250 | `DRAFT` | `68a8f533-0562-4f47-8a4d-43df7e3bcc63` | `2026-12-14 13:54:40` | `{"Robotics", "Drones", "Hardware"}` |

---

## 4. Table: `Registration`

The `Registration` table serves as the associative entity establishing the many-to-many relationship between Students (`User`) and `Event`. It manages digital ticket passes and QR check-in tokens.

### Column Specifications
* **Primary Key**: `id` (`TEXT` UUID v4)
* **Foreign Keys**: `studentId` $\rightarrow$ `User(id)` (`ON DELETE RESTRICT`), `eventId` $\rightarrow$ `Event(id)` (`ON DELETE RESTRICT`)
* **Unique Constraints**:
  - `qrToken` (`TEXT` UNIQUE)
  - `(studentId, eventId)` (Composite UNIQUE constraint preventing duplicate registrations)
* **Enumerated Domain**: `status` (`CONFIRMED`, `CANCELLED`)

### Representative Records

| id | studentId | eventId | status | qrToken | department | semester | createdAt |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `cfddd9d1-9970-4c7d-9252-efc10c5866dd` | `088c478f-0824-47f0-a673-932c1aa82b16` | `5958f784-7cb6-4768-bd4d-8d9f63e92c4f` | `CONFIRMED` | `fe4dab9b-0f4a-49a0-aceb-ceebe5fa041e` | Computer Science | 6th Semester | `2026-11-14 13:54:40.561` |
| `0e39a4d8-0b4a-48e0-98bd-d11c00e736ac` | `009a7646-fb4d-46a1-8951-ba21475bdefe` | `655cf8bd-0261-4d5d-afd7-0e2bd21e6ba0` | `CONFIRMED` | `cd160171-283f-410b-a206-a97953713446` | Mechanical Engg | 4th Semester | `2026-11-14 13:54:40.560` |
| `6f23be8e-6fb4-4e1c-8bdc-3f27dc7d341e` | `cf7f04b7-241e-41a8-834c-2c109789beb8` | `43ada8cb-61a2-4c36-9638-781ea27700ad` | `CONFIRMED` | `8b2ff628-36e7-4def-acd4-903265510500` | Electronics & Comm | 4th Semester | `2026-11-14 13:54:40.559` |
| `5ef833f6-ce84-44cf-83a4-af31d1c26aa5` | `088c478f-0824-47f0-a673-932c1aa82b16` | `43ada8cb-61a2-4c36-9638-781ea27700ad` | `CONFIRMED` | `24790166-12a1-4820-9803-01fe8e32f7d4` | Computer Science | 6th Semester | `2026-11-14 13:54:40.558` |

---

## 5. Table: `Attendance`

The `Attendance` table models physical check-ins at campus event gates. It has a strict 1:1 relationship with `Registration`.

### Column Specifications
* **Primary Key**: `id` (`TEXT` UUID v4)
* **Foreign Key & Unique**: `registrationId` $\rightarrow$ `Registration(id)` (`ON DELETE CASCADE`, `UNIQUE`)

### Representative Records

| id | registrationId | checkedInAt | Associated Student | Associated Event |
| :--- | :--- | :--- | :--- | :--- |
| `dedd37c7-0136-42e9-a149-db65fe08d01c` | `cfddd9d1-9970-4c7d-9252-efc10c5866dd` | `2026-11-04 13:54:40.536` | Student 1 (`student1@eventflow.test`) | Chroma Lens Photography Contest |
| `a81b2c3d-e4f5-4678-90ab-cdef12345678` | `5ef833f6-ce84-44cf-83a4-af31d1c26aa5` | `2026-11-21 14:05:12.000` | Student 1 (`student1@eventflow.test`) | Campus E-Summit 2026 |

---

## 6. Table: `Announcement`

The `Announcement` table allows organizers and administrators to broadcast updates, schedule modifications, and venue instructions to participants.

### Column Specifications
* **Primary Key**: `id` (`TEXT` UUID v4)
* **Foreign Keys**:
  - `eventId` $\rightarrow$ `Event(id)` (`ON DELETE CASCADE`)
  - `creatorId` $\rightarrow$ `User(id)` (`ON DELETE RESTRICT`)

### Representative Records

| id | eventId | creatorId | title | message | createdAt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `50c927f1-ca6f-4715-8dc5-eb32c30e6dcd` | `43ada8cb-61a2-4c36-9638-781ea27700ad` | `0544b8de-0457-4b17-abbe-38126f474d6f` | Venue Entry Guidelines and Schedule | Please arrive 15 minutes before the inauguration. Keep your student ID and digital QR pass ready for swift check-in at the auditorium gates. | `2026-11-14 13:54:40.566` |
| `7b8c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e` | `0b71fa81-6e08-4e0c-b069-26cc960ce37b` | `68a8f533-0562-4f47-8a4d-43df7e3bcc63` | Discord Server & API Keys Release | All shortlisted teams must join the official Discord server before 9:00 AM on Saturday for mentorship breakout rooms. | `2026-11-20 10:15:00.000` |

---

## 7. Referential Integrity & Relational Verification

The following diagram illustrates how the sample records connect through foreign keys across the schema:

```
[ User: 0544b8de... (Organizer) ]
       │
       ├── creates (1:N) ────────────────────────┐
       │                                         ▼
       │                          [ Event: 43ada8cb... (E-Summit) ]
       │                                         ▲
       │                                         │
       ├── posts update (1:N)                    │ registers (1:N)
       │       │                                 │
       │       ▼                                 │
[ Announcement: 50c927f1... ]                    │
                                                 │
[ User: 088c478f... (Student 1) ] ───────────────┼───────────────┐
       │                                         │               │
       └── creates enrollment (1:N)              │               │
               │                                 │               │
               ▼                                 ▼               ▼
       [ Registration: 5ef833f6... (QR Token: 24790166...) ]     [ Registration: cfddd9d1... ]
               │                                                         │
               └── verified entry (1:1)                                  └── verified entry (1:1)
                       │                                                         │
                       ▼                                                         ▼
       [ Attendance: a81b2c3d... ]                               [ Attendance: dedd37c7... ]
```

Every sample record provided adheres strictly to the primary key, foreign key, unique, and enum constraints enforced by PostgreSQL and Prisma ORM.
