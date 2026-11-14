import prisma, { isDatabaseReady } from "../config/prisma.js";
import { generateQrToken, verifyQrToken } from "../utils/qr.js";
import { ROLES } from "../validators/auth.validator.js";

export const getRegistrationQr = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDatabaseReady() && prisma?.registration) {
      const registration = await prisma.registration.findUnique({
        where: { id },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true,
              venue: true,
              organizerId: true
            }
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: `Registration not found with ID: ${id}`
        });
      }

      const isOwner = req.user.id === registration.studentId;
      const isOrganizer = req.user.id === registration.event.organizerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

      if (!isOwner && !isOrganizer && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to access this registration QR code"
        });
      }

      if (registration.status === "CANCELLED") {
        return res.status(400).json({
          success: false,
          message: "Cannot generate QR ticket for a cancelled registration"
        });
      }

      const qrToken = registration.qrToken || generateQrToken(registration.id, registration.eventId);

      return res.status(200).json({
        success: true,
        data: {
          registrationId: registration.id,
          eventId: registration.eventId,
          eventTitle: registration.event.title,
          studentName: registration.student.name,
          qrToken,
          status: registration.status
        }
      });
    }

    const fallbackQr = generateQrToken(id, "evt-preview");
    return res.status(503).json({
      success: false,
      message: "Registration QR query is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Registration/Attendance model schemas"
      },
      data: {
        registrationId: id,
        generatedQrToken: fallbackQr
      }
    });
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const { qrToken, eventId } = req.body;

    if (isDatabaseReady() && prisma?.attendance && prisma?.registration) {
      let registration = null;

      if (qrToken.startsWith("efqr_")) {
        const parts = qrToken.split("_");
        const regId = parts[1];
        registration = await prisma.registration.findUnique({
          where: { id: regId },
          include: {
            event: true,
            student: {
              select: { id: true, name: true, email: true }
            },
            attendance: true
          }
        });

        if (registration && !verifyQrToken(qrToken, registration.id, registration.eventId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid or tampered QR ticket token"
          });
        }
      } else {
        registration = await prisma.registration.findUnique({
          where: { qrToken },
          include: {
            event: true,
            student: {
              select: { id: true, name: true, email: true }
            },
            attendance: true
          }
        });
      }

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: "Invalid QR code: Registration record not found"
        });
      }

      if (eventId && registration.eventId !== eventId) {
        return res.status(400).json({
          success: false,
          message: "This registration ticket is not valid for this event"
        });
      }

      const isOrganizer = req.user.id === registration.event.organizerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

      if (!isOrganizer && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to record attendance for this event"
        });
      }

      if (registration.status === "CANCELLED") {
        return res.status(400).json({
          success: false,
          message: "Cannot check in: Registration has been cancelled"
        });
      }

      if (registration.attendance) {
        return res.status(409).json({
          success: false,
          message: "Student is already checked in for this event",
          data: {
            alreadyCheckedInAt: registration.attendance.checkedInAt
          }
        });
      }

      const attendance = await prisma.attendance.create({
        data: {
          registrationId: registration.id,
          checkedInAt: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        message: "Attendance recorded successfully",
        data: {
          attendanceId: attendance.id,
          registrationId: registration.id,
          eventId: registration.eventId,
          eventTitle: registration.event.title,
          student: registration.student,
          checkedInAt: attendance.checkedInAt
        }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Attendance check-in is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Attendance model schema"
      },
      data: {
        qrToken,
        eventId: eventId || null,
        checkedInBy: req.user.id
      }
    });
  } catch (error) {
    next(error);
  }
};

export const manualCheckIn = async (req, res, next) => {
  try {
    const { registrationId, eventId, studentId, notes } = req.body;

    if (isDatabaseReady() && prisma?.attendance && prisma?.registration) {
      let registration = null;

      if (registrationId) {
        registration = await prisma.registration.findUnique({
          where: { id: registrationId },
          include: {
            event: true,
            student: { select: { id: true, name: true, email: true } },
            attendance: true
          }
        });
      } else if (eventId && studentId) {
        registration = await prisma.registration.findFirst({
          where: {
            eventId,
            studentId,
            status: { not: "CANCELLED" }
          },
          include: {
            event: true,
            student: { select: { id: true, name: true, email: true } },
            attendance: true
          }
        });
      }

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: "Registration not found for the specified student and event"
        });
      }

      const isOrganizer = req.user.id === registration.event.organizerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

      if (!isOrganizer && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to record attendance for this event"
        });
      }

      if (registration.status === "CANCELLED") {
        return res.status(400).json({
          success: false,
          message: "Cannot manually check in a cancelled registration"
        });
      }

      if (registration.attendance) {
        return res.status(409).json({
          success: false,
          message: "Student is already checked in for this event",
          data: {
            alreadyCheckedInAt: registration.attendance.checkedInAt
          }
        });
      }

      const attendance = await prisma.attendance.create({
        data: {
          registrationId: registration.id,
          checkedInAt: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        message: "Manual attendance recorded successfully",
        data: {
          attendanceId: attendance.id,
          registrationId: registration.id,
          eventId: registration.eventId,
          eventTitle: registration.event.title,
          student: registration.student,
          checkedInAt: attendance.checkedInAt,
          notes: notes || null
        }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Manual check-in is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Attendance model schema"
      },
      data: {
        registrationId: registrationId || null,
        eventId: eventId || null,
        studentId: studentId || null,
        notes: notes || null
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getEventAttendance = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;

    if (isDatabaseReady() && prisma?.event && prisma?.attendance) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          registrations: {
            include: {
              student: {
                select: { id: true, name: true, email: true }
              },
              attendance: true
            }
          }
        }
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: `Event not found with ID: ${eventId}`
        });
      }

      const isOrganizer = req.user.id === event.organizerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

      if (!isOrganizer && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to view attendance records for this event"
        });
      }

      const totalRegistrations = event.registrations.filter((r) => r.status !== "CANCELLED").length;
      const checkedInList = event.registrations
        .filter((r) => Boolean(r.attendance))
        .map((r) => ({
          attendanceId: r.attendance.id,
          registrationId: r.id,
          studentId: r.student.id,
          studentName: r.student.name,
          studentEmail: r.student.email,
          checkedInAt: r.attendance.checkedInAt
        }));

      const attendanceCount = checkedInList.length;
      const attendanceRatePercent = totalRegistrations > 0
        ? Math.round((attendanceCount / totalRegistrations) * 100)
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          eventId: event.id,
          eventTitle: event.title,
          capacity: event.capacity,
          totalRegistrations,
          attendanceCount,
          attendanceRatePercent,
          attendees: checkedInList
        }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Event attendance query is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Attendance model schema"
      },
      data: { eventId }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    if (isDatabaseReady() && prisma?.registration) {
      const records = await prisma.registration.findMany({
        where: {
          studentId,
          attendance: { isNot: null }
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              category: true,
              startDate: true,
              endDate: true,
              location: true,
              venue: true
            }
          },
          attendance: true
        },
        orderBy: {
          attendance: {
            checkedInAt: "desc"
          }
        }
      });

      const history = records.map((r) => ({
        attendanceId: r.attendance.id,
        registrationId: r.id,
        event: r.event,
        checkedInAt: r.attendance.checkedInAt
      }));

      return res.status(200).json({
        success: true,
        data: {
          totalAttended: history.length,
          attendanceHistory: history
        }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Student attendance records query is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Attendance model schema"
      },
      data: { studentId }
    });
  } catch (error) {
    next(error);
  }
};
