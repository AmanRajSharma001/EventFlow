import prisma, { isDatabaseReady } from "../config/prisma.js";
import { ROLES } from "../validators/auth.validator.js";
import { EVENT_STATUS } from "../validators/event.validator.js";

export const getAdminDashboard = async (req, res, next) => {
  try {
    if (isDatabaseReady() && prisma?.user && prisma?.event && prisma?.registration) {
      const [
        totalUsers,
        studentCount,
        organizerCount,
        adminCount,
        totalEvents,
        publishedEvents,
        draftEvents,
        completedEvents,
        cancelledEvents,
        totalRegistrations,
        cancelledRegistrations,
        totalAttendance,
        recentEvents
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: ROLES.STUDENT } }),
        prisma.user.count({ where: { role: ROLES.ORGANIZER } }),
        prisma.user.count({ where: { role: ROLES.ADMIN } }),
        prisma.event.count(),
        prisma.event.count({ where: { status: EVENT_STATUS.PUBLISHED } }),
        prisma.event.count({ where: { status: EVENT_STATUS.DRAFT } }),
        prisma.event.count({ where: { status: EVENT_STATUS.COMPLETED } }),
        prisma.event.count({ where: { status: EVENT_STATUS.CANCELLED } }),
        prisma.registration.count({ where: { status: { not: "CANCELLED" } } }),
        prisma.registration.count({ where: { status: "CANCELLED" } }),
        prisma.attendance ? prisma.attendance.count() : 0,
        prisma.event.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            startDate: true,
            capacity: true,
            _count: {
              select: { registrations: true }
            }
          }
        })
      ]);

      const attendanceRatePercent = totalRegistrations > 0
        ? Math.round((totalAttendance / totalRegistrations) * 100)
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            students: studentCount,
            organizers: organizerCount,
            admins: adminCount
          },
          events: {
            total: totalEvents,
            published: publishedEvents,
            draft: draftEvents,
            completed: completedEvents,
            cancelled: cancelledEvents
          },
          participation: {
            totalRegistrations,
            cancelledRegistrations,
            totalAttendance,
            attendanceRatePercent
          },
          recentEvents
        }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Admin dashboard analytics is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma schemas"
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizerDashboard = async (req, res, next) => {
  try {
    const organizerId = req.user.id;

    if (isDatabaseReady() && prisma?.event) {
      const events = await prisma.event.findMany({
        where: { organizerId },
        orderBy: { startDate: "asc" },
        include: {
          registrations: {
            select: {
              id: true,
              status: true,
              attendance: {
                select: { id: true, checkedInAt: true }
              }
            }
          }
        }
      });

      const totalEvents = events.length;
      const publishedEvents = events.filter((e) => e.status === EVENT_STATUS.PUBLISHED).length;
      const draftEvents = events.filter((e) => e.status === EVENT_STATUS.DRAFT).length;
      const completedEvents = events.filter((e) => e.status === EVENT_STATUS.COMPLETED).length;

      let totalRegistrations = 0;
      let totalAttendance = 0;
      let totalCapacity = 0;

      const eventsSummary = events.map((e) => {
        const confirmedRegs = e.registrations.filter((r) => r.status !== "CANCELLED").length;
        const attended = e.registrations.filter((r) => Boolean(r.attendance)).length;
        totalRegistrations += confirmedRegs;
        totalAttendance += attended;
        totalCapacity += e.capacity;

        return {
          id: e.id,
          title: e.title,
          category: e.category,
          status: e.status,
          startDate: e.startDate,
          capacity: e.capacity,
          registrationsCount: confirmedRegs,
          attendanceCount: attended,
          fillRatePercent: e.capacity > 0 ? Math.round((confirmedRegs / e.capacity) * 100) : 0,
          attendanceRatePercent: confirmedRegs > 0 ? Math.round((attended / confirmedRegs) * 100) : 0
        };
      });

      const overallAttendanceRate = totalRegistrations > 0
        ? Math.round((totalAttendance / totalRegistrations) * 100)
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalEvents,
            publishedEvents,
            draftEvents,
            completedEvents,
            totalCapacity,
            totalRegistrations,
            totalAttendance,
            overallAttendanceRate
          },
          events: eventsSummary
        }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Organizer dashboard analytics is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma schemas"
      },
      data: { organizerId }
    });
  } catch (error) {
    next(error);
  }
};

export const getEventDetailedStatistics = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;

    if (isDatabaseReady() && prisma?.event) {
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

      const isOwner = req.user.id === event.organizerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to view statistics for this event"
        });
      }

      const activeRegistrations = event.registrations.filter((r) => r.status !== "CANCELLED");
      const cancelledRegistrations = event.registrations.filter((r) => r.status === "CANCELLED");
      const attendedList = activeRegistrations.filter((r) => Boolean(r.attendance));

      const confirmedCount = activeRegistrations.length;
      const attendanceCount = attendedList.length;
      const capacityRemaining = Math.max(0, event.capacity - confirmedCount);
      const capacityUtilizationPercent = event.capacity > 0
        ? Math.min(100, Math.round((confirmedCount / event.capacity) * 100))
        : 0;
      const attendanceRatePercent = confirmedCount > 0
        ? Math.round((attendanceCount / confirmedCount) * 100)
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          eventId: event.id,
          title: event.title,
          status: event.status,
          capacity: event.capacity,
          startDate: event.startDate,
          endDate: event.endDate,
          registrations: {
            confirmed: confirmedCount,
            cancelled: cancelledRegistrations.length,
            capacityRemaining,
            capacityUtilizationPercent
          },
          attendance: {
            checkedIn: attendanceCount,
            absent: Math.max(0, confirmedCount - attendanceCount),
            attendanceRatePercent
          }
        }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Event detailed statistics query is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma schemas"
      },
      data: { eventId }
    });
  } catch (error) {
    next(error);
  }
};
