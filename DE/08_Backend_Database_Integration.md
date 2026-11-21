# EventFlow — Backend & Database Integration Architecture

This document details the software architecture, data flow, query execution pipeline, and transaction management connecting the **EventFlow** client application, Node.js/Express backend API, **Prisma ORM**, and the **PostgreSQL** relational database.

---

## 1. End-to-End System Architecture & Data Flow

EventFlow employs a layered, decoupled client-server architecture designed for high maintainability, strict separation of concerns, and reliable ACID data persistence.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER (FRONTEND)                         │
│   React 18 SPA (Vite) / Electron Desktop Container                          │
│   - Zustand State Stores (Auth, Events, Registrations)                     │
│   - Axios HTTP Client with Bearer Token Interceptors                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / RESTful JSON
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API & ROUTING LAYER (EXPRESS)                        │
│   Express 4 Server (`backend/src/app.js` & `server.js`)                     │
│   - CORS & Security Headers                                                │
│   - Request Rate Limiting & Body Parsing                                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE PIPELINE (`src/middleware/`)                 │
│   1. `validate(schema)`: Zod schema contract validation                   │
│   2. `authenticateToken`: JWT signature verification & claims extraction   │
│   3. `requireRole(roles)`: Role-Based Access Control (STUDENT/ORGANIZER/ADMIN)│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Authorized Request Context
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     BUSINESS CONTROLLER LAYER (`src/controllers/`)          │
│   - `auth.controller.js`: User lifecycle, bcrypt, dual-identifier login     │
│   - `event.controller.js`: CRUD, tag filtering, lifecycle progression      │
│   - `registration.controller.js`: Serializable ticket booking & capacity   │
│   - `attendance.controller.js`: QR ticket issue & 1:1 entrance check-in     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Strongly Typed Method Invocations
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     OBJECT-RELATIONAL MAPPING (PRISMA ORM)                  │
│   - Client Generator: `@prisma/client` (`generated/prisma/client.ts`)      │
│   - Driver Adapter: `@prisma/adapter-pg`                                    │
│   - Prepared Statements & Parameterized Query Compiler                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ TCP / Unix Domain Socket (Port 5432)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE ENGINE (POSTGRESQL)                     │
│   - Relational Tables: "User", "Event", "Registration", "Attendance", etc. │
│   - Foreign Key Cascades & Unique Constraints                              │
│   - Multi-Version Concurrency Control (MVCC) & WAL Storage                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Connection Management

### 2.1 Configuration & Environment Discovery (`backend/src/config/env.js`)
To support both headless cloud deployments and packaged desktop installations, EventFlow implements an environment discovery cascade in `backend/src/config/env.js`:

```javascript
const candidatePaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../../.env"),
  path.join(process.env.HOME || "", "Library/Application Support/EventFlow/.env"),
  path.join(process.env.HOME || "", ".eventflow.env")
];
```

This ensures that when running inside Electron on macOS, the runtime automatically locates credentials in macOS Application Support without hardcoded paths.

### 2.2 Prisma Adapter Initialization (`backend/src/config/prisma.js`)
EventFlow utilizes the modern `@prisma/adapter-pg` driver adapter. Instead of relying on a standalone binary query engine, Prisma communicates with PostgreSQL through a pooled driver:

```javascript
import config from "./env.js";

let prisma = null;

if (process.env.DATABASE_URL) {
  try {
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const { PrismaClient } = await import("../../generated/prisma/client.ts");
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL
    });
    prisma = new PrismaClient({ adapter });
  } catch (error) {
    console.error("[Prisma Init Error] Failed to initialize Prisma client:", error?.message || error);
    prisma = null;
  }
}

export const isDatabaseReady = () => Boolean(process.env.DATABASE_URL && prisma);
```

### 2.3 Health Check & Graceful Degradation
The backend monitors connectivity through an active probe function:

```javascript
export async function checkDatabaseConnection() {
  if (!isDatabaseReady()) {
    return {
      connected: false,
      error: process.env.DATABASE_URL ? "Prisma client initialization failed" : "DATABASE_URL not configured"
    };
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (err) {
    return { connected: false, error: err?.message || "Database connection test failed" };
  }
}
```

If the PostgreSQL server is offline or unreachable, controllers cleanly abort operations with HTTP `503 Service Unavailable` rather than crashing the Node process.

---

## 3. How API Routes Interact with the Database

### 3.1 Authentication & Dual-Identifier Account Discovery (`auth.controller.js`)
During user sign-in, students frequently identify themselves by either their university email or their University Roll Number (URN / `rollNumber`). The backend executes a case-insensitive multi-field lookup:

```javascript
const lookupKey = (identifier || rollNumber || email || "").trim();

const user = await prisma.user.findFirst({
  where: {
    OR: [
      { email: { equals: lookupKey.toLowerCase(), mode: "insensitive" } },
      { rollNumber: { equals: lookupKey.toUpperCase(), mode: "insensitive" } },
      { rollNumber: { equals: lookupKey, mode: "insensitive" } }
    ]
  }
});
```

* **Security**: Passwords are never stored in plain text. Registration executes `await bcrypt.hash(password, 10)`. During login, `await bcrypt.compare(password, user.password)` validates credentials.
* **Projection Security**: Queries deliberately omit `password` from returned JSON payloads using Prisma's `select` block.

---

### 3.2 High-Concurrency Event Registration (`registration.controller.js`)
To solve the classic **ticket overselling / race condition** flaw when hundreds of students attempt to book the final available seats simultaneously, EventFlow wraps the registration logic in an interactive Prisma transaction with strict `Serializable` isolation:

```javascript
const result = await prisma.$transaction(async (tx) => {
  // 1. Fetch event capacity and current confirmed enrollment count
  const event = await tx.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: {
          registrations: { where: { status: REGISTRATION_STATUS.CONFIRMED } }
        }
      }
    }
  });

  if (!event) throw new Error("Event not found");
  if (event.status !== EVENT_STATUS.PUBLISHED) throw new Error("Registration is closed");
  
  // 2. Capacity Guard Check
  if (event._count.registrations >= event.capacity) {
    const err = new Error("This event has reached full capacity");
    err.statusCode = 400;
    throw err;
  }

  // 3. Existing Enrollment Check
  const existingRegistration = await tx.registration.findFirst({
    where: { eventId, studentId }
  });

  if (existingRegistration?.status === REGISTRATION_STATUS.CONFIRMED) {
    const err = new Error("You are already registered for this event");
    err.statusCode = 409;
    throw err;
  }

  // 4. Create Confirmed Ticket Pass with UUID qrToken
  return await tx.registration.create({
    data: {
      eventId,
      studentId,
      status: REGISTRATION_STATUS.CONFIRMED,
      notes: notes || null,
      department: department || null,
      semester: semester || null
    }
  });
}, { isolationLevel: "Serializable" });
```

#### Handling Serialization Failures (`P2034`)
When concurrent transactions conflict under `Serializable` isolation, PostgreSQL aborts the overlapping transaction. The controller catches this Prisma error code specifically:

```javascript
} catch (error) {
  if (error?.code === "P2034") {
    return res.status(409).json({
      success: false,
      message: "Could not complete registration due to high concurrent demand, please try again"
    });
  }
  // Standard error forwarding...
}
```

---

### 3.3 QR-Based Entrance Check-In (`attendance.controller.js`)
Physical venue entry is governed by the 1:1 relational link between `Registration` and `Attendance`:

```javascript
// Check if student has already entered the venue
if (registration.attendance) {
  return res.status(409).json({
    success: false,
    message: "Student is already checked in for this event",
    data: { alreadyCheckedInAt: registration.attendance.checkedInAt }
  });
}

// Record physical check-in
const attendance = await prisma.attendance.create({
  data: {
    registrationId: registration.id,
    checkedInAt: new Date()
  }
});
```

Because `Attendance.registrationId` carries a **UNIQUE** database constraint, duplicate check-ins are rejected at both the application and database engine layers.

---

## 4. Query Compilation & SQL Injection Prevention

Prisma ORM protects EventFlow against SQL Injection by default:
1. **Parameterized Queries**: All dynamic criteria (IDs, emails, search keywords) are translated into bind parameters (`$1`, `$2`) in PostgreSQL.
2. **Type Safety**: TypeScript compiler and runtime validation prevent malicious query payloads.
3. **Escaped Raw Queries**: When analytical queries use raw execution, EventFlow relies on tagged templates (`prisma.$queryRaw` or strict parameter arrays in `prisma.$queryRawUnsafe`) to prevent string concatenation attacks.

---

## 5. Error Handling & Mapping

EventFlow centralizes database error translation in an Express error middleware (`backend/src/middleware/error.middleware.js`):

| Prisma / Engine Error Code | Database Exception Type | Express HTTP Response | User-Facing Message |
| :--- | :--- | :---: | :--- |
| **`P2002`** | Unique Constraint Violation | `409 Conflict` | "A record with this unique field (email/URN/QR) already exists." |
| **`P2003`** | Foreign Key Constraint Failed | `400 Bad Request` | "Referenced entity does not exist or cannot be linked." |
| **`P2025`** | Record Not Found | `404 Not Found` | "The requested resource could not be found." |
| **`P2034`** | Transaction Serialization Conflict | `409 Conflict` | "Concurrency conflict; please retry." |
| **`ECONNREFUSED`** | PostgreSQL Offline | `503 Service Unavailable` | "Database service currently unreachable." |
