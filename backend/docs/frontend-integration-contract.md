# EventFlow Backend API Contract & Integration Guide

This document specifies the complete API contract implemented for the EventFlow backend, targeting the sequential handoff on November 14, 2026.

## Base Configuration

- Base URL: `http://localhost:5000/api`
- CORS: Configured for `http://localhost:5173`, `http://localhost:3000`, and configurable via `CORS_ORIGIN`.
- Content-Type: `application/json`
- Authentication Header: `Authorization: Bearer <token>`

## 1. Authentication Endpoints

### Register User
- Method: `POST`
- Path: `/api/auth/register`
- Access: Public
- Request Body:
```json
{
  "name": "Student Name",
  "email": "student@college.edu",
  "password": "password123"
}
```
- Note: Role automatically defaults to `STUDENT`. Self-assigning `ADMIN` or `ORGANIZER` is rejected with HTTP 400.

### Login
- Method: `POST`
- Path: `/api/auth/login`
- Access: Public
- Request Body:
```json
{
  "email": "student@college.edu",
  "password": "password123"
}
```
- Response: Returns signed JWT token and sanitized user profile.

### Current User Profile
- Method: `GET`
- Path: `/api/auth/me`
- Access: Protected (`Bearer <token>`)

---

## 2. Event Management Endpoints

### List / Browse Events
- Method: `GET`
- Path: `/api/events`
- Access: Public (returns published events); Organizers can pass `mine=true` to view drafts; Admins can view all.
- Query Parameters: `search`, `category`, `page`, `limit`, `status`, `mine`.

### Event Details
- Method: `GET`
- Path: `/api/events/:id`
- Access: Public for published events; draft events restricted to owner/admin.

### Create Event
- Method: `POST`
- Path: `/api/events`
- Access: `ORGANIZER`, `ADMIN`
- Request Body:
```json
{
  "title": "Hackathon 2026",
  "description": "Annual college programming hackathon",
  "category": "Technology",
  "startDate": "2026-11-20T09:00:00Z",
  "endDate": "2026-11-21T18:00:00Z",
  "location": "Auditorium Main Hall",
  "capacity": 250,
  "registrationDeadline": "2026-11-19T23:59:00Z"
}
```

### Update Event
- Method: `PATCH`
- Path: `/api/events/:id`
- Access: Event Owner (`ORGANIZER`), `ADMIN`

### Delete Event
- Method: `DELETE`
- Path: `/api/events/:id`
- Access: Event Owner (`ORGANIZER`), `ADMIN` (cannot delete events with confirmed attendees; must cancel).

### Publish Event
- Method: `PATCH`
- Path: `/api/events/:id/publish`
- Access: Event Owner (`ORGANIZER`), `ADMIN`

### Organizer Events List
- Method: `GET`
- Path: `/api/events/organizer/my`
- Access: `ORGANIZER`, `ADMIN`

---

## 3. Student Registration Endpoints

### Register for Event
- Method: `POST`
- Path: `/api/events/:id/register`
- Access: `STUDENT` only
- Request Body (optional fields):
```json
{
  "department": "Computer Science",
  "semester": "6th Semester",
  "notes": "Team lead"
}
```

### My Registrations
- Method: `GET`
- Path: `/api/registrations/my`
- Access: `STUDENT` only

### Event Registrations List
- Method: `GET`
- Path: `/api/events/:id/registrations`
- Access: Event Owner (`ORGANIZER`), `ADMIN`

### Cancel Registration
- Method: `PATCH`
- Path: `/api/registrations/:id/cancel`
- Access: Registration Owner (`STUDENT`), `ADMIN`
- Request Body:
```json
{
  "reason": "Personal conflict"
}
```

---

## 4. QR Attendance Endpoints

### Get Registration QR Token
- Method: `GET`
- Path: `/api/registrations/:id/qr`
- Access: Registration Owner (`STUDENT`), Event Organizer, `ADMIN`
- Response: Returns opaque cryptographic token (`efqr_<registrationId>_<signature>`).

### Check-in Attendee via QR
- Method: `POST`
- Path: `/api/attendance/check-in`
- Access: `ORGANIZER`, `ADMIN`
- Request Body:
```json
{
  "qrToken": "efqr_reg-uuid_signature",
  "eventId": "event-uuid"
}
```

### Manual Check-in
- Method: `POST`
- Path: `/api/attendance/manual`
- Access: `ORGANIZER`, `ADMIN`
- Request Body:
```json
{
  "registrationId": "reg-uuid",
  "notes": "Verified college ID manually"
}
```

### Event Attendance Records
- Method: `GET`
- Path: `/api/events/:id/attendance`
- Access: Event Owner (`ORGANIZER`), `ADMIN`

### My Verified Attendance
- Method: `GET`
- Path: `/api/attendance/my`
- Access: `STUDENT` only

---

## 5. Announcements Endpoints

### Post Event Announcement
- Method: `POST`
- Path: `/api/events/:id/announcements`
- Access: Event Owner (`ORGANIZER`), `ADMIN`
- Request Body:
```json
{
  "title": "Venue Update",
  "message": "Qualifiers shifted to Hall B",
  "priority": "HIGH",
  "isPinned": true
}
```

### Get Event Announcements
- Method: `GET`
- Path: `/api/events/:id/announcements`
- Access: Public (published events); Organizer/Admin (all)

### Delete Announcement
- Method: `DELETE`
- Path: `/api/announcements/:id`
- Access: Creator, Event Organizer, `ADMIN`

---

## 6. Analytics & Dashboards

### Admin Dashboard
- Method: `GET`
- Path: `/api/admin/dashboard`
- Access: `ADMIN` only

### Organizer Dashboard
- Method: `GET`
- Path: `/api/organizer/dashboard`
- Access: `ORGANIZER`, `ADMIN`

### Event Detailed Statistics
- Method: `GET`
- Path: `/api/events/:id/statistics`
- Access: Event Owner (`ORGANIZER`), `ADMIN`

---

## 7. Electron Integration Notes for Azmol

1. In the Electron main process, start the Express backend as a child process using `fork` or `spawn` (`node backend/src/server.js`) on app startup, or connect to the running local API port (`5000`).
2. Pass `VITE_API_BASE_URL=http://localhost:5000/api` to the frontend bundle.
3. Use standard `localStorage.getItem('eventflow_token')` for JWT session persistence, which is automatically handled by the Axios client in `frontend/src/services/api.js`.
