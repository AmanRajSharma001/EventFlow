// This module provides a function to register a student for an event while preventing race conditions.
// It uses a Prisma transaction with SERIALIZABLE isolation so that two concurrent
// attempts to fill the last seat cannot both succeed.

import prisma from "../config/prisma.js";

/**
 * Register a student for an event.
 *
 * @param {string} studentId - The ID of the user who wants to register.
 * @param {string} eventId   - The ID of the event to register for.
 * @returns {Promise<Object>} The created or updated registration record.
 * @throws Will throw an Error with a plain‑English message if any rule is violated.
 */
export async function registerStudent(studentId, eventId) {
  try {
    // Run everything inside a SERIALIZABLE transaction to avoid the classic
    // “two students take the last seat” race condition.
    return await prisma.$transaction(async (tx) => {
      // Load the event first.
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });
      if (!event) {
        throw new Error("Event not found");
      }

      // The event must be open for registration.
      if (event.status !== "PUBLISHED") {
        throw new Error("Event is not open for registration");
      }

      // Deadline check – if the current time is after the deadline, reject.
      if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
        throw new Error("Registration deadline has passed");
      }

      // Count already registered students.
      const registeredCount = await tx.registration.count({
        where: {
          eventId,
          status: "CONFIRMED",
        },
      });
      if (registeredCount >= event.capacity) {
        throw new Error("Event is full");
      }

      // Look for an existing registration for this student & event.
      const existing = await tx.registration.findFirst({
        where: { studentId, eventId },
      });

      if (existing) {
        if (existing.status === "CONFIRMED") {
          throw new Error("Already registered");
        }
        if (existing.status === "CANCELLED") {
          // Reactivate a cancelled registration and clear cancellation details.
          return await tx.registration.update({
            where: { id: existing.id },
            data: {
              status: "CONFIRMED",
              cancelledAt: null,
              cancellationReason: null,
            },
          });
        }
      }

      // No registration exists – create a new one.
      return await tx.registration.create({
        data: {
          studentId,
          eventId,
          status: "CONFIRMED",
        },
      });
    }, { isolationLevel: "Serializable" });
  } catch (e) {
    // Prisma throws a generic error with a code property for conflicts.
    if (e?.code === "P2034") {
      throw new Error("Could not complete registration, please try again");
    }
    // Re‑throw any other error unchanged.
    throw e;
  }
}
