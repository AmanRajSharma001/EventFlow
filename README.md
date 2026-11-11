# EventFlow

EventFlow is a college event management and participation system. It is intended to give students one place to discover campus events and register, while helping event organizers manage event information and participation.

The current repository contains a public React frontend preview and an early Express API foundation. Several flows still use sample data and browser-local state; see [Current status and limitations](#current-status-and-limitations) before treating the project as production-ready.

## Features in the current frontend

- Public landing page with event highlights and category links.
- Event discovery with title/club/venue search, category selection, upcoming and past event views, and popularity sorting based on the available sample data.
- Event detail pages with event information and related events.
- Login and student registration screens with preview behavior.
- Preview sign-in, student profile, and event registration state stored in the current browser.
- Shared navigation, footer, form, badge, button, loading, empty, and error components.

Preview interactions do not create server-side accounts or event registrations.

## Technology stack

### Frontend

- React 19 and JavaScript (ES modules)
- Vite
- Tailwind CSS 4
- React Router
- Axios API client
- Lucide React icons
- Oxlint

### Backend

- Node.js and Express 5 (ES modules)
- Zod request validation and role enforcement
- CORS and JSON request parsing
- Centralized error handling and 404 middleware
- `bcrypt` password hashing and verification
- `jsonwebtoken` generation and authentication middleware
- Role-based authorization middleware (STUDENT, ORGANIZER, ADMIN)
- Automated test suite using Node.js test runner (`node --test`)
- Configurable environment via `dotenv`
- Database abstraction ready for Sagar's PostgreSQL and Prisma integration

## Project structure

```text
EventFlow/
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       │   ├── env.js
│       │   └── prisma.js
│       ├── controllers/
│       │   └── auth.controller.js
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   ├── error.middleware.js
│       │   └── validate.middleware.js
│       ├── routes/
│       │   └── auth.routes.js
│       ├── test/
│       │   └── auth.test.js
│       ├── utils/
│       │   ├── jwt.js
│       │   └── password.js
│       └── validators/
│           └── auth.validator.js
├── frontend/
│   ├── .env.example
│   ├── .oxlintrc.json
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── events/
│   │   │   └── layout/
│   │   ├── context/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/public/
│   │   ├── services/
│   │   └── utils/
│   └── vite.config.js
├── .gitignore
├── LICENSE
└── README.md
```

The `frontend/` and `backend/` directories are siblings at the repository root. There is no second `frontend/` directory inside `backend/` in this checkout.

## Prerequisites

- Node.js and npm. The package manifests do not declare a specific Node.js version.
- Git, if you are cloning the repository.

## Installation and local development

Clone the repository, then use separate terminals for the API and frontend:

```sh
git clone https://github.com/AmanRajSharma001/EventFlow.git
cd EventFlow
```

### Start the backend

```sh
cd backend
npm ci
npm run dev
```

The current server listens on port `3000`. Check that it is responding at [http://localhost:3000/api/health](http://localhost:3000/api/health).

### Start the frontend

In another terminal, from the repository root:

```sh
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite. The public preview can also run without the backend.

## Environment variables

Both frontend and backend support environment variable configuration:

### Backend

Create `backend/.env` based on `backend/.env.example`:

```dotenv
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Frontend

The frontend API client reads `VITE_API_BASE_URL` (defaults to `http://localhost:5000/api`). If you want to customize the API base URL, create `frontend/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

Vite variables are included in client-side code. Do not place secrets, private API keys, or credentials in `VITE_*` variables.

## Development commands

Run commands from the relevant package directory.

| Directory | Command | Purpose |
| --- | --- | --- |
| `frontend/` | `npm run dev` | Start the Vite development server. |
| `frontend/` | `npm run lint` | Run Oxlint. |
| `frontend/` | `npm run build` | Create the production bundle in `frontend/dist/`. |
| `frontend/` | `npm run preview` | Serve the built frontend locally. Run `npm run build` first. |
| `backend/` | `npm run dev` | Start the API with nodemon. |
| `backend/` | `npm start` | Start the API with Node.js. |
| `backend/` | `npm test` | Run the automated test suite with Node.js test runner. |

## API

The following endpoints are implemented in the Express backend:

| Method | Path | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Service health check with status, uptime, environment, and timestamp. | Public |
| `POST` | `/api/auth/register` | Validates input (Zod), hashes password (bcrypt), enforces default STUDENT role, blocks privilege escalation, and checks DB readiness. | Public |
| `POST` | `/api/auth/login` | Validates credentials (Zod), compares password hash (bcrypt), verifies DB readiness, and issues signed JWT. | Public |
| `GET` | `/api/auth/me` | Returns the authenticated user's safe profile (never exposes password). | Protected (`Bearer <token>`) |

## Current status and limitations

- The public frontend routes are `/`, `/events`, `/events/:id`, `/login`, and `/register`.
- Event content is sample data in `frontend/src/data/mockEvents.js`.
- Preview profiles and registrations are stored in browser local storage and are not synchronized between browsers or users.
- The shared Axios client is prepared for API use, but the current preview authentication and registration flows are not backed by the Express API.
- The backend currently provides a health endpoint and a validated registration stub. It does not yet persist users or events, implement login/JWT authorization, or connect to a database.
- Student, organizer, and faculty dashboards, event management, attendance tracking, and verified participation records are not implemented in this repository.
- No automated test script is currently defined in either package.

## Future improvements

- Implement and document database-backed authentication and role-based authorization.
- Connect event discovery, registration, and profiles to persistent API endpoints.
- Add organizer event management, attendee management, and attendance workflows.
- Build student and faculty/coordinator portal pages and participation reports.
- Add automated unit and integration tests, and document the complete API contract.
- Align the frontend example API URL with the backend configuration and make the backend port configurable.
