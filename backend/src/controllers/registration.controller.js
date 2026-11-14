import prisma, { isDatabaseReady } from "../config/prisma.js";
import { REGISTRATION_STATUS } from "../validators/registration.validator.js";
import { EVENT_STATUS } from "../validators/event.validator.js";
import { ROLES } from "../validators/auth.validator.js";

export const registerForEvent = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const { notes, department, semester } = req.body;
    const studentId = req.user.id;

    if (req.user.role !== ROLES.STUDENT) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only students are eligible to register for campus events"
      });
    }

    if (isDatabaseReady() && prisma?.registration && prisma?.event) {
      const result = await prisma.$transaction(async (tx) => {
        const event = await tx.event.findUnique({
          where: { id: eventId },
          include: {
            _count: {
              select: {
                registrations: {
                  where: { status: REGISTRATION_STATUS.CONFIRMED }
                }
              }
            }
          }
        });

        if (!event) {
          const err = new Error(`Event not found with ID: ${eventId}`);
          err.statusCode = 404;
          throw err;
        }

        if (event.status !== EVENT_STATUS.PUBLISHED) {
          const err = new Error("Registration is only open for published events");
          err.statusCode = 400;
          throw err;
        }

        const now = new Date();
        if (event.registrationDeadline && now > new Date(event.registrationDeadline)) {
          const err = new Error("Registration deadline for this event has passed");
          err.statusCode = 400;
          throw err;
        }

        if (now >= new Date(event.startDate)) {
          const err = new Error("Cannot register for an event that has already started or completed");
          err.statusCode = 400;
          throw err;
        }

        if (event._count.registrations >= event.capacity) {
          const err = new Error("This event has reached full capacity");
          err.statusCode = 400;
          throw err;
        }

        const existingRegistration = await tx.registration.findFirst({
          where: {
            eventId,
            studentId,
            status: REGISTRATION_STATUS.CONFIRMED
          }
        });

        if (existingRegistration) {
          const err = new Error("You are already registered for this event");
          err.statusCode = 409;
          throw err;
        }

        const newRegistration = await tx.registration.create({
          data: {
            eventId,
            studentId,
            status: REGISTRATION_STATUS.CONFIRMED,
            notes: notes || null,
            department: department || null,
            semester: semester || null
          },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                location: true
              }
            }
          }
        });

        return newRegistration;
      });

      return res.status(201).json({
        success: true,
        message: "Successfully registered for event",
        data: { registration: result }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Event registration validated, but awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Registration model schema"
      },
      data: {
        eventId,
        studentId,
        notes: notes || null,
        department: department || null,
        semester: semester || null,
        status: REGISTRATION_STATUS.CONFIRMED
      }
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

export const getMyRegistrations = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    if (isDatabaseReady() && prisma?.registration) {
      const registrations = await prisma.registration.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              startDate: true,
              endDate: true,
              location: true,
              status: true
            }
          }
        }
      });

      return res.status(200).json({
        success: true,
        data: { registrations }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Student registrations query is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Registration model schema"
      },
      data: { studentId }
    });
  } catch (error) {
    next(error);
  }
};

export const getEventRegistrations = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;

    if (isDatabaseReady() && prisma?.event && prisma?.registration) {
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: `Event not found with ID: ${eventId}`
        });
      }

      const isOwner = req.user.id === event.organizerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to view participants for this event"
        });
      }

      const registrations = await prisma.registration.findMany({
        where: { eventId },
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      const confirmedCount = registrations.filter((r) => r.status === REGISTRATION_STATUS.CONFIRMED).length;
      const cancelledCount = registrations.filter((r) => r.status === REGISTRATION_STATUS.CANCELLED).length;

      return res.status(200).json({
        success: true,
        data: {
          eventId,
          eventTitle: event.title,
          capacity: event.capacity,
          confirmedCount,
          cancelledCount,
          registrations
        }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Event registrations query is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Registration model schema"
      },
      data: { eventId }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRegistration = async (req, res, next) => {
  try {
    const { id: registrationId } = req.params;
    const { reason } = req.body;

    if (isDatabaseReady() && prisma?.registration) {
      const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: {
          event: true
        }
      });

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: `Registration not found with ID: ${registrationId}`
        });
      }

      const isOwner = req.user.id === registration.studentId;
      const isAdmin = req.user.role === ROLES.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only cancel your own registration"
        });
      }

      if (registration.status === REGISTRATION_STATUS.CANCELLED) {
        return res.status(400).json({
          success: false,
          message: "Registration is already cancelled"
        });
      }

      if (registration.event && new Date() >= new Date(registration.event.startDate)) {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel registration for an event that has already started"
        });
      }

      const updated = await prisma.registration.update({
        where: { id: registrationId },
        data: {
          status: REGISTRATION_STATUS.CANCELLED,
          cancellationReason: reason || null,
          cancelledAt: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        message: "Registration cancelled successfully",
        data: { registration: updated }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Registration cancellation requested, but awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Registration model schema"
      },
      data: {
        registrationId,
        studentId: req.user.id,
        reason: reason || null
      }
    });
  } catch (error) {
    next(error);
  }
};
