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

- Node.js and Express 5
- Zod request validation
- CORS and JSON request parsing
- `bcrypt`, `jsonwebtoken`, and `dotenv` are listed as dependencies, but the current API code does not yet implement database-backed authentication or load backend environment variables.

There is no database or Prisma schema in the current repository.

## Project structure

```text
EventFlow/
├── backend/
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── controllers/
│       │   └── auth.controller.js
│       ├── middleware/
│       │   └── validate.middleware.js
│       ├── routes/
│       │   └── auth.routes.js
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

The frontend API client reads `VITE_API_BASE_URL`. The checked-in `frontend/.env.example` currently points to `http://localhost:5000/api`, while the backend server currently listens on port `3000`. If you want the frontend API client to target this local backend, create `frontend/.env` and set:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api
```

Vite variables are included in client-side code. Do not place secrets, private API keys, or credentials in `VITE_*` variables. The current backend does not read environment variables; its port is hard-coded in `backend/src/server.js`.

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

## API

The repository does not contain an OpenAPI/Swagger specification. The following endpoints are present in the Express source:

| Method | Path | Current behavior |
| --- | --- | --- |
| `GET` | `/api/health` | Returns a JSON health response with `success: true` and `message: "EventFlow API is running"`. |
| `POST` | `/api/auth/register` | Validates the request body, then currently returns HTTP `501` because registration is not implemented. |

The registration request accepts `name` (at least 2 characters), a valid `email`, `password` (at least 8 characters), and an optional `role` of `STUDENT`, `ORGANIZER`, or `ADMIN`. Invalid input returns HTTP `400` with validation errors. A valid request is not persisted and receives a `501` response. A login validation schema exists, but there is currently no login API route.

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
