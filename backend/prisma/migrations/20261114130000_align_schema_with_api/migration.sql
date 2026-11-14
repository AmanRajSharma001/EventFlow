-- Event: rename venue to location, add publishedAt, make endDate and registrationDeadline optional
ALTER TABLE "Event" RENAME COLUMN "venue" TO "location";
ALTER TABLE "Event" ADD COLUMN "publishedAt" TIMESTAMP(3);
ALTER TABLE "Event" ALTER COLUMN "endDate" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "registrationDeadline" DROP NOT NULL;

-- Registration: REGISTERED becomes CONFIRMED, registeredAt becomes createdAt, add detail columns
ALTER TYPE "RegistrationStatus" RENAME VALUE 'REGISTERED' TO 'CONFIRMED';
ALTER TABLE "Registration" RENAME COLUMN "registeredAt" TO "createdAt";
ALTER TABLE "Registration" ADD COLUMN "notes" TEXT, ADD COLUMN "department" TEXT, ADD COLUMN "semester" TEXT, ADD COLUMN "cancellationReason" TEXT, ADD COLUMN "cancelledAt" TIMESTAMP(3);

