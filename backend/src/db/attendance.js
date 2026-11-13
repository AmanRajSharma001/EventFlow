// Database helper functions for managing event registrations and attendance check-ins.
// Handles student cancellations and QR token verification at venue entrance.

import prisma from "../config/prisma.js";

// Cancels a student's registration for an event.
// Sets the registration status to CANCELLED instead of deleting the record to preserve audit history.
// If the student has already checked into the event, cancellation is blocked.
export async function cancelRegistration(registrationId) {
  // Find the registration along with any existing attendance check-in
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { attendance: true },
  });

  if (!registration) {
    throw new Error("Registration not found");
  }

  if (registration.attendance) {
    throw new Error("Already checked in, cannot cancel");
  }

  // Update status to CANCELLED
  return await prisma.registration.update({
    where: { id: registrationId },
    data: { status: "CANCELLED" },
  });
}

// Checks in a student at the venue by scanning their unique QR token.
// Confirms that the QR code is valid, active (not cancelled), and not already checked in.
export async function checkInByQrToken(qrToken) {
  // Find registration by unique qrToken, including event and attendance details
  const registration = await prisma.registration.findUnique({
    where: { qrToken },
    include: {
      event: true,
      attendance: true,
    },
  });

  if (!registration) {
    throw new Error("Invalid QR code");
  }

  if (registration.status !== "REGISTERED") {
    throw new Error("Registration was cancelled");
  }

  if (registration.attendance) {
    throw new Error("Already checked in");
  }

  try {
    // Create attendance check-in record.
    // If two organizers scan the same QR token simultaneously, the database
    // unique constraint on registrationId triggers error code P2002, preventing double check-in.
    return await prisma.attendance.create({
      data: {
        registrationId: registration.id,
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new Error("Already checked in");
    }
    throw error;
  }
}

