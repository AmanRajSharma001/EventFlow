# Prisma Database Schema Coordination for Sagar

This document outlines the Prisma schema models, fields, enums, and constraints required by the EventFlow backend implementation.

## Required Enums

```prisma
enum Role {
  STUDENT
  ORGANIZER
  ADMIN
}

enum EventStatus {
  DRAFT
  PUBLISHED
  CANCELLED
  COMPLETED
}

enum RegistrationStatus {
  CONFIRMED
  CANCELLED
  WAITLISTED
  ATTENDED
}
```

## Required Models

```prisma
model User {
  id            String         @id @default(uuid())
  name          String
  email         String         @unique
  password      String
  role          Role           @default(STUDENT)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  events        Event[]        @relation("OrganizerEvents")
  registrations Registration[] @relation("StudentRegistrations")

  @@map("users")
}

model Event {
  id                   String         @id @default(uuid())
  title                String
  description          String
  category             String
  startDate            DateTime
  endDate              DateTime?
  location             String
  capacity             Int
  registrationDeadline DateTime?
  status               EventStatus    @default(DRAFT)
  publishedAt          DateTime?
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt

  organizerId          String
  organizer            User           @relation("OrganizerEvents", fields: [organizerId], references: [id], onDelete: Cascade)

  registrations        Registration[]

  @@index([status])
  @@index([category])
  @@index([startDate])
  @@index([organizerId])
  @@map("events")
}

model Registration {
  id                 String             @id @default(uuid())
  eventId            String
  studentId          String
  status             RegistrationStatus @default(CONFIRMED)
  notes              String?
  department         String?
  semester           String?
  cancellationReason String?
  cancelledAt        DateTime?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  event              Event              @relation(fields: [eventId], references: [id], onDelete: Cascade)
  student            User               @relation("StudentRegistrations", fields: [studentId], references: [id], onDelete: Cascade)

  @@index([eventId])
  @@index([studentId])
  @@index([status])
  @@map("registrations")
}
```

## Backend Integration Details

1. `backend/src/config/prisma.js` dynamically detects `@prisma/client`.
2. All controller operations use Prisma transaction API (`prisma.$transaction`) for race-condition-safe student registrations.
3. Once Sagar adds these models to `prisma/schema.prisma` and runs `npx prisma migrate dev`, the backend will instantly query PostgreSQL without modifying controller logic.
