# EventFlow — College Event Management & Participation System

EventFlow is a desktop application developed as a college major project to streamline event organization, student registrations, attendance verification, and campus engagement across university departments and student clubs.

The project combines a React and Tailwind CSS user interface, an Express.js REST backend, a PostgreSQL relational database managed with Prisma, and an Electron desktop wrapper packaged into a standalone macOS DMG installer.

---

## 1. Problem Statement

Campus event management in colleges frequently suffers from fragmented communication, manual spreadsheets, and inefficient paper-based ticket check-ins:
- Students miss important club workshops, guest lectures, and cultural fests due to scattered notice boards and multiple chat groups.
- Event organizers struggle with manual seat limits, overbooking, and duplicate registrations.
- On the day of an event, verifying attendance with printed rosters causes long queues at campus auditoriums.
- Faculty coordinators and administration lack real-time visibility into student participation metrics and event analytics.

---

## 2. Our Solution

EventFlow provides a unified platform addressing the full lifecycle of campus events:
- **Centralized Event Portal**: Students can discover upcoming department and club events, view schedules, check seat availability, and register with one click.
- **Automated Registration Management**: Serialized database transactions enforce strict capacity limits and prevent overbooking or duplicate registrations.
- **Fast QR Ticket Check-In**: Students receive a secure, tamper-proof QR pass upon registration that organizers can scan at the venue entrance for instant check-in.
- **Role-Based Portals**: Distinct workflows tailored for Students, Club Organizers, and College Administrators.
- **Desktop Application Delivery**: Packaged with Electron to give campus lab workstations, club desks, and faculty offices a native desktop application with local backend process management.

---

## 3. Main Features

### Student Portal
- Browse upcoming workshops, cultural fests, sports tournaments, and hackathons with search and category filters.
- Real-time seat availability indicator and registration deadline countdown.
- One-click event registration with optional department and semester notes.
- Self-service registration cancellation before event start time.
- Digital ticket modal with dynamic QR code pass for venue check-in.
- Attendance history tracking verified participation across college events.
- Notification feed for event announcements and schedule changes.

### Organizer Portal
- Event lifecycle management: Draft, Publish, Complete, or Cancel events.
- Real-time participant roster with student names, roll numbers, and contact details.
- QR code attendance scanner and manual check-in fallback for venue entry.
- Event announcement broadcasting to notify registered attendees.
- Event-specific analytics including registration turnout percentage and check-in timeline.

### Administrator Portal
- Campus-wide dashboard tracking total users, events, registrations, and attendance rates.
- Department-wise event distribution and category breakdown.
- User directory oversight covering student profiles and organizer privileges.
- Campus-wide broadcast announcements.

---

## 4. Technology Stack

- **Desktop Framework**: Electron 34 / 45
- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React, React Router DOM v7
- **Backend**: Node.js, Express.js 5, Zod validation, bcrypt, jsonwebtoken (JWT)
- **Database**: PostgreSQL, Prisma ORM 7, `@prisma/adapter-pg`
- **Packaging & Distribution**: `electron-builder`, macOS ARM64 `.dmg` installer

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                    │
│  - Window Management & Native Menus (1280x850)              │
│  - Secure IPC Preload Bridge (contextIsolation, no nodeIntegration) │
│  - Managed Backend Child Process Spawner (Port 5001)        │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│       Renderer Process       │ │     Express REST Backend     │
│   React 19 + Tailwind CSS    │ │   - JWT Authentication       │
│   - Student Dashboard        │ │   - Event CRUD & Publishing  │
│   - Organizer Dashboard      │ │   - QR Verification Engine   │
│   - Admin Oversight Portal   │ │   - Analytics Aggregation    │
└──────────────┬───────────────┘ └──────────────┬───────────────┘
               │ (HTTP / Localhost 5001)        │
               └────────────────────────────────┤
                                                ▼
                                 ┌──────────────────────────────┐
                                 │     PostgreSQL + Prisma 7    │
                                 │   - Users & Role Constraints │
                                 │   - Events & Registrations   │
                                 │   - QR Tokens & Attendance   │
                                 │   - Serializable Isolation   │
                                 └──────────────────────────────┘
```

---

## 6. Project Folder Structure

```
EventFlow/
├── electron/
│   ├── main.cjs           # Electron main process (lifecycle & child backend process)
│   ├── preload.cjs        # Secure contextBridge preload script
│   └── dev.js             # Development orchestrator (Vite + Electron)
├── frontend/
│   ├── public/            # Static assets and favicon
│   ├── src/
│   │   ├── components/    # Reusable UI, student, organizer, and admin components
│   │   ├── context/       # Auth, Organizer, and Admin React context providers
│   │   ├── data/          # Seed demo accounts and mock student fallbacks
│   │   ├── pages/         # Public, Student, Organizer, and Admin pages
│   │   ├── services/      # Axios API services and adapters
│   │   ├── App.jsx        # Routing configuration with Desktop HashRouter support
│   │   └── main.jsx       # React DOM entry point
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── prisma/
│   │   ├── migrations/    # Version-controlled PostgreSQL SQL migrations
│   │   └── schema.prisma  # Prisma data models, relations, and enums
│   ├── scripts/
│   │   ├── seed.js        # Database seed script for test accounts and events
│   │   ├── db-check.js    # PostgreSQL connection health check script
│   │   └── smoke-auth.js  # Authentication smoke test script
│   ├── db-tests/          # Prisma database model and relation test suite
│   ├── docs/              # API contract and database schema documentation
│   ├── src/
│   │   ├── config/        # Environment and Prisma client configuration
│   │   ├── controllers/   # Auth, Event, Registration, Attendance, Analytics controllers
│   │   ├── middleware/    # JWT authentication, role authorization, validation middleware
│   │   ├── routes/        # Express route modules
│   │   ├── test/          # Node test runner backend test suites (auth, events, e2e)
│   │   ├── utils/         # JWT, password hashing, and QR token utilities
│   │   ├── validators/    # Zod schemas for input validation
│   │   ├── app.js         # Express app configuration
│   │   └── server.js      # Server entry point (Port 5001)
│   ├── package.json
│   └── .env.example
├── build/
│   ├── icon.icns          # macOS application bundle icon
│   └── icon.png           # 512x512 application icon
├── release/               # Output directory for generated macOS DMG
├── package.json           # Root project metadata and Electron packaging scripts
├── LICENSE                # MIT License
└── README.md
```

---

## 7. Team Members and Individual Contributions

This project was built collaboratively by a team of three student developers:

### Aman Raj Sharma — Backend Development & Application Integration
- Designed and implemented the Express.js REST API architecture.
- Developed authentication, bcrypt password hashing, and JWT authorization middleware.
- Implemented event lifecycle logic (creation, drafts, publishing, and capacity checks).
- Built the student registration engine with Serializable database transactions to prevent race conditions.
- Implemented attendance verification and HMAC QR code token generation.
- Built dashboard analytics controllers for organizer and administrator portals.
- Developed the automated test suites (`auth.test.js`, `events.test.js`, and `e2e.test.js`).
- Integrated the desktop Electron wrapper, managed child process lifecycle, and packaged the macOS DMG installer.

### Azmol — Frontend Development
- Designed and built the React 19 user interface using Vite and Tailwind CSS.
- Implemented responsive page layouts for public landing, event browsing, and event details.
- Developed dedicated dashboards for Students, Club Organizers, and College Administrators.
- Implemented client-side authentication persistence, session management, and role-based route guards.
- Integrated Axios API clients, response adapters, and graceful fallback handling for pending database states.
- Created reusable UI components (modals, ticket badges, status chips, form fields, and empty states).

### Sagar — Database Development
- Designed the PostgreSQL relational schema and Prisma 7 data models.
- Established primary-foreign key relationships, cascade delete rules, and compound unique constraints (`[studentId, eventId]`).
- Created and maintained version-controlled database migrations (`prisma/migrations`).
- Built the automated seed script (`backend/scripts/seed.js`) generating demo users, events, registrations, and announcements.
- Wrote database unit and concurrency tests (`backend/db-tests/*.test.js`) verifying registration uniqueness and transaction isolation.

---

## 8. Application Development (ISD)

EventFlow is implemented as a desktop application using Electron to provide a native experience on college lab machines and administrative laptops.

### Main Process (`electron/main.cjs`)
The Main Process runs in a Node.js environment responsible for:
- Creating and configuring the primary `BrowserWindow` (1280x850 resolution, minimum 960x640).
- Setting macOS-specific application menus with standard keyboard shortcuts (`Cmd+C`, `Cmd+V`, `Cmd+A`, `Cmd+Z`) ensuring text fields function naturally.
- Managing the backend process lifecycle:
  - Before opening the window, it tests if an EventFlow backend is already listening on `http://localhost:5001/api/health`.
  - If not running, it automatically spawns the Express backend as a managed child process using Electron's Node runtime (`ELECTRON_RUN_AS_NODE=1`).
  - Upon window closure or application exit, it cleanly terminates the child backend process (`SIGTERM`).

### Preload Script (`electron/preload.cjs`)
The preload script establishes a secure bridge using Electron's `contextBridge`:
- `contextIsolation: true`: Isolates the renderer's JavaScript context from Electron internal APIs.
- `nodeIntegration: false`: Completely disables direct Node.js access in the DOM, preventing arbitrary system execution from untrusted content.
- `sandbox: true`: Enforces the Chromium renderer sandbox.
- Exposes a minimal, safe API surface under `window.electron` for desktop detection and backend health queries.

### Navigation and Security
- Restricts external URL navigation. Any non-local link is intercepted and opened in the user's default system web browser via `shell.openExternal`.
- Prevents arbitrary pop-ups by denying unhandled `window.open` calls via `setWindowOpenHandler`.

### Desktop Routing Integration
To support the `file://` protocol when running from a packaged DMG without breaking browser navigation in development, `frontend/src/App.jsx` dynamically switches between `HashRouter` (in packaged `file://` mode) and `BrowserRouter` (in web/dev mode). This eliminates blank screens on page reloads inside the desktop application.

---

## 9. Prerequisites

- **Node.js**: Version 20.x, 22.x, or 24.x+ (tested on Node 26)
- **npm**: Version 10.x or 11.x
- **PostgreSQL**: Version 14 or higher (running locally on port 5432)
- **macOS**: macOS Monterey (12.0) or later (Apple Silicon ARM64 supported)

---

## 10. Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/AmanRajSharma001/EventFlow.git
cd EventFlow
```

### 2. Install dependencies

Install root, backend, and frontend dependencies:

```bash
# Install root packaging dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

---

## 11. Environment Variable Configuration

### Backend Configuration (`backend/.env`)

Create `backend/.env` based on `backend/.env.example`:

```ini
PORT=5001
NODE_ENV=development
JWT_SECRET=eventflow_development_secret_key_change_in_production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/eventflow"
```

*Note: Port 5001 is used by default because port 5000 is reserved on macOS for AirPlay Receiver.*

### Frontend Configuration (`frontend/.env`)

```ini
VITE_API_BASE_URL=http://localhost:5001/api
```

---

## 12. Database Setup and Migrations

Ensure PostgreSQL is running, then create the database:

```bash
# Create database
createdb eventflow

# Navigate to backend directory
cd backend

# Run Prisma migrations
npm run db:migrate

# Seed demo users, events, and registrations
npm run db:seed

# Verify database connection
npm run db:check

cd ..
```

---

## 13. Running the Project

### 13. Deployment Modes

EventFlow supports three operating modes with identical business logic and database persistence:

#### Mode A — Connected Website (Production Web Deployment)
The frontend website runs independently in any standard browser and communicates with a remote or hosted Express API:
```bash
# Frontend environment: frontend/.env
VITE_API_BASE_URL=https://api.eventflow.college.edu/api

# Build production web bundle
npm run build:frontend
```
- Frontend connects to the configured production API via Axios with automatic Bearer token injection.
- Backend handles CORS with origin allowlisting via `CORS_ORIGIN`.
- Session tokens are stored securely in browser `localStorage`.
- All CRUD operations persist to PostgreSQL via Prisma.

#### Mode B — Independent Local Development
Frontend and backend develop independently without requiring Electron:
```bash
# Terminal 1: Start Express backend with Nodemon on port 5001
npm run dev:backend

# Terminal 2: Start React Vite frontend dev server on port 5173
npm run dev:frontend
```
- Backend connects to local PostgreSQL.
- Frontend communicates with `http://localhost:5001/api`.
- Hot module reloading (HMR) is active on both tiers.

#### Mode C — Electron macOS DMG (Standalone Desktop App)
The packaged macOS desktop application runs with an embedded Express backend:
```bash
# Package DMG installer
npm run dist:mac
# Produces release/EventFlow-macOS-1.0.2.dmg
```
- Electron spawns the packaged backend child process on port 5001.
- Database configuration is read from `~/Library/Application Support/EventFlow/.env`.
- Frontend is served locally with `file://` protocol and HashRouter.

---

## 14. Building and Running the macOS DMG Installer

To compile the React production bundle and package the standalone macOS ARM64 `.dmg` installer:

```bash
npm run dist:mac
```

The installer will be generated in the `release/` folder:
- **Installer file**: `release/EventFlow-macOS-1.0.3.dmg` (v1.0.0, v1.0.1, and v1.0.2 preserved)
- **Architecture**: Apple Silicon ARM64
- **Code Signing**: ARM64 Ad-Hoc Signed with sealed bundle resources (`edu.college.eventflow`)

### Database Configuration for Packaged Desktop Mode

To ensure the packaged desktop application securely connects to your PostgreSQL database without hardcoding credentials into the distributed DMG:

1. **Option A (Recommended — Application Support)**: Create `~/Library/Application Support/EventFlow/.env` with your PostgreSQL connection string:
   ```bash
   mkdir -p "$HOME/Library/Application Support/EventFlow"
   echo 'DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/eventflow"' > "$HOME/Library/Application Support/EventFlow/.env"
   chmod 600 "$HOME/Library/Application Support/EventFlow/.env"
   ```

2. **Option B (Home directory)**: Place `.eventflow.env` in your user home directory:
   ```bash
   echo 'DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/eventflow"' > "$HOME/.eventflow.env"
   ```

3. **Option C (Environment variable)**: Export `DATABASE_URL` before launching from terminal:
   ```bash
   export DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/eventflow"
   open /Applications/EventFlow.app
   ```

### Installing and Running on macOS

1. Double-click `release/EventFlow-macOS-1.0.3.dmg` to mount the disk image.
2. Drag **EventFlow** into your **Applications** folder.
3. Open EventFlow from Launchpad or Applications.

#### macOS Gatekeeper First-Launch Note
Because EventFlow is an academic student project and is not signed with a paid ($99/yr) Apple Developer ID Certificate, Apple Gatekeeper blocks apps downloaded from the web by default with the prompt:
> *"Apple could not verify EventFlow is free of malware that may harm your Mac or compromise your privacy."*

The application's code signature and resource seal are fully verified and intact. To launch on macOS Sonoma or Sequoia:
- **Method 1 (Recommended)**: Go to **System Settings → Privacy & Security**. Scroll down to the **Security** section where you will see: *"EventFlow was blocked from use because it is not from an identified developer."* Click **Open Anyway**, authenticate with Touch ID or password, and click **Open**.
- **Method 2**: In `/Applications`, **Right-click (or Control-click)** `EventFlow.app`, choose **Open** from the context menu, then click **Open** in the dialog.
- Once opened once, macOS registers the user approval and EventFlow opens normally without prompts on all subsequent launches.

---

## 15. Testing

EventFlow includes comprehensive test suites across backend API routes and Prisma database models:

```bash
# Run backend Express API tests (39 tests: auth, events, e2e)
npm run test:backend

# Run Prisma database model & concurrency tests (39 tests)
npm run test:db
```

---

## 16. Seeded Demo Accounts

The database seed script (`backend/scripts/seed.js`) provides pre-configured accounts for testing:

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Student** | `student1@eventflow.test` | `Password@123` | Event registration, digital ticket, QR pass |
| **Student** | `student2@eventflow.test` | `Password@123` | Secondary student registration testing |
| **Organizer** | `organizer1@eventflow.test` | `Password@123` | E-Cell organizer: event creation, roster, check-in |
| **Organizer** | `organizer2@eventflow.test` | `Password@123` | Technical Society organizer |
| **Administrator** | `admin@eventflow.test` | `Password@123` | Central administration: oversight, analytics, users |

*When running without an active PostgreSQL database, the desktop application automatically provides one-click mock demo profiles in the login interface.*

---

## 17. API Overview

All API endpoints are prefixed with `/api`:

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student account
- `POST /api/auth/login` — Log in and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated profile (from PostgreSQL)
- `PATCH /api/auth/me` — Update student/organizer profile details (persisted to PostgreSQL)

### Events (`/api/events`)
- `GET /api/events` — Browse published events (filters: category, search, page)
- `GET /api/events/:id` — View detailed event information
- `POST /api/events` — Create new event (Organizer/Admin)
- `PATCH /api/events/:id` — Update event details (Event Organizer/Admin)
- `DELETE /api/events/:id` — Delete event (Event Organizer/Admin)
- `PATCH /api/events/:id/publish` — Publish draft event (Event Organizer/Admin)
- `GET /api/events/organizer/my` — List organizer's managed events

### Registrations (`/api/registrations` & `/api/events/:id/register`)
- `POST /api/events/:id/register` — Register for an event (Student only, Serializable isolation)
- `GET /api/registrations/my` — List logged-in student's registrations
- `GET /api/events/:id/registrations` — View event attendee roster (Organizer/Admin)
- `PATCH /api/registrations/:id/cancel` — Cancel registration

### Attendance & QR Verification (`/api/attendance`)
- `GET /api/registrations/:id/qr` — Get secure QR verification token
- `POST /api/attendance/check-in` — Verify QR pass and record venue check-in (Organizer/Admin)
- `POST /api/attendance/manual-check-in` — Manual check-in fallback (Organizer/Admin)
- `GET /api/events/:id/attendance` — View event check-in statistics and attendee list
- `GET /api/attendance/my` — View personal verified attendance history

### Announcements & Analytics (`/api/announcements` & `/api/admin/analytics`)
- `GET /api/events/:id/announcements` — List updates for an event
- `POST /api/events/:id/announcements` — Post new announcement (Organizer/Admin)
- `GET /api/admin/analytics/dashboard` — Platform overview metrics (Admin)
- `GET /api/events/:id/statistics` — Specific event turnout statistics (Organizer/Admin)

---

## 18. Known Limitations

- **Gatekeeper Unnotarized Developer Prompt**: As an academic open-source student project developed without an enterprise Apple Developer Program subscription, the application is code-signed with ARM64 ad-hoc sealing rather than an Apple Developer ID certificate. On macOS Sonoma/Sequoia, first launch requires clicking "Open Anyway" in System Settings > Privacy & Security or right-clicking to Open.
- **Single Window Experience**: Designed as a unified single-window desktop application. Multi-window workflows are not currently enabled.
- **Offline Mode**: If PostgreSQL is stopped, the application displays clear dependency warnings and switches to read-only demonstration accounts. Real-time check-in scanning requires a running PostgreSQL instance.

---

## 19. Future Improvements

- Native camera integration in Electron for direct web camera QR code scanning without relying on external USB barcode readers.
- Automated email notification delivery for registration confirmation and venue updates using SMTP.
- PDF ticket export with embedded QR code pass for offline printing.
- Cross-platform build targets for Windows (`.exe` / NSIS) and Linux (`.AppImage` / `.deb`).
- Real-time attendance updates over WebSockets for live auditorium display boards.

---

## 20. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
