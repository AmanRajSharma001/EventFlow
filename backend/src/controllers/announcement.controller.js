import prisma, { isDatabaseReady } from "../config/prisma.js";
import { ROLES } from "../validators/auth.validator.js";
import { EVENT_STATUS } from "../validators/event.validator.js";

export const createAnnouncement = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const { title, message, priority, isPinned } = req.body;
    const creatorId = req.user.id;

    if (isDatabaseReady() && prisma?.event && prisma?.announcement) {
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
          message: "Forbidden: You are not authorized to post announcements for this event"
        });
      }

      const announcement = await prisma.announcement.create({
        data: {
          eventId,
          creatorId,
          title,
          message
        },
        include: {
          creator: {
            select: { id: true, name: true, role: true }
          }
        }
      });

      return res.status(201).json({
        success: true,
        message: "Announcement posted successfully",
        data: {
          announcement: {
            ...announcement,
            priority: priority || "NORMAL",
            isPinned: Boolean(isPinned)
          }
        }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Announcement posting is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Announcement model schema"
      },
      data: {
        eventId,
        creatorId,
        title,
        message,
        priority: priority || "NORMAL",
        isPinned: Boolean(isPinned)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getEventAnnouncements = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;

    if (isDatabaseReady() && prisma?.event && prisma?.announcement) {
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: `Event not found with ID: ${eventId}`
        });
      }

      const isOwner = req.user && req.user.id === event.organizerId;
      const isAdmin = req.user && req.user.role === ROLES.ADMIN;

      if (event.status !== EVENT_STATUS.PUBLISHED && !isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Cannot view announcements for an unpublished event"
        });
      }

      const announcements = await prisma.announcement.findMany({
        where: { eventId },
        orderBy: { createdAt: "desc" },
        include: {
          creator: {
            select: { id: true, name: true, role: true }
          }
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          eventId,
          eventTitle: event.title,
          count: announcements.length,
          announcements
        }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Event announcements query is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Announcement model schema"
      },
      data: { eventId }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDatabaseReady() && prisma?.announcement) {
      const announcement = await prisma.announcement.findUnique({
        where: { id },
        include: {
          event: true
        }
      });

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: `Announcement not found with ID: ${id}`
        });
      }

      const isCreator = req.user.id === announcement.creatorId;
      const isEventOrganizer = announcement.event && req.user.id === announcement.event.organizerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

      if (!isCreator && !isEventOrganizer && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to delete this announcement"
        });
      }

      await prisma.announcement.delete({
        where: { id }
      });

      return res.status(200).json({
        success: true,
        message: "Announcement deleted successfully"
      });
    }

    return res.status(503).json({
      success: false,
      message: "Announcement deletion requested, but awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Announcement model schema"
      },
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};
