import prisma, { isDatabaseReady } from "../config/prisma.js";
import { EVENT_STATUS } from "../validators/event.validator.js";
import { ROLES } from "../validators/auth.validator.js";

export const getEvents = async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 10, mine } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    if (isDatabaseReady() && prisma?.event) {
      const where = {};

      if (category) {
        where.category = { equals: category, mode: "insensitive" };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } }
        ];
      }

      const isOrganizer = req.user?.role === ROLES.ORGANIZER;
      const isAdmin = req.user?.role === ROLES.ADMIN;

      if (mine === "true" && req.user) {
        where.organizerId = req.user.id;
        if (status && (isOrganizer || isAdmin)) {
          where.status = status;
        }
      } else if (isAdmin) {
        if (status) where.status = status;
      } else if (isOrganizer) {
        if (status && status !== EVENT_STATUS.PUBLISHED) {
          where.OR = [
            { status: EVENT_STATUS.PUBLISHED },
            { organizerId: req.user.id, status }
          ];
        } else {
          where.status = EVENT_STATUS.PUBLISHED;
        }
      } else {
        where.status = EVENT_STATUS.PUBLISHED;
      }

      const [total, events] = await Promise.all([
        prisma.event.count({ where }),
        prisma.event.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { startDate: "asc" },
          include: {
            _count: {
              select: { registrations: true }
            }
          }
        })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          events,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1
          }
        }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Event browsing is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Event model schema"
      },
      filters: {
        search: search || null,
        category: category || null,
        page: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDatabaseReady() && prisma?.event) {
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          _count: {
            select: { registrations: true }
          }
        }
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: `Event not found with ID: ${id}`
        });
      }

      const isOwner = req.user && req.user.id === event.organizerId;
      const isAdmin = req.user && req.user.role === ROLES.ADMIN;

      if (event.status !== EVENT_STATUS.PUBLISHED && !isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to view this unpublished event"
        });
      }

      return res.status(200).json({
        success: true,
        data: { event }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Event retrieval is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Event model schema"
      },
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, startDate, endDate, location, capacity, registrationDeadline } = req.body;
    const organizerId = req.user.id;

    if (isDatabaseReady() && prisma?.event) {
      const newEvent = await prisma.event.create({
        data: {
          title,
          description,
          category,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          location,
          capacity,
          registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
          status: EVENT_STATUS.DRAFT,
          organizerId
        }
      });

      return res.status(201).json({
        success: true,
        message: "Event created successfully as DRAFT",
        data: { event: newEvent }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Event creation validated, but awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Event model schema"
      },
      data: {
        title,
        description,
        category,
        startDate,
        endDate: endDate || null,
        location,
        capacity,
        registrationDeadline: registrationDeadline || null,
        status: EVENT_STATUS.DRAFT,
        organizerId
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isDatabaseReady() && prisma?.event) {
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          _count: {
            select: { registrations: true }
          }
        }
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: `Event not found with ID: ${id}`
        });
      }

      const isOwner = req.user.id === event.organizerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to update this event"
        });
      }

      if (event.status === EVENT_STATUS.COMPLETED || event.status === EVENT_STATUS.CANCELLED) {
        return res.status(400).json({
          success: false,
          message: `Cannot update an event that is already ${event.status.toLowerCase()}`
        });
      }

      if (updates.capacity && updates.capacity < event._count.registrations) {
        return res.status(400).json({
          success: false,
          message: `Capacity cannot be reduced below the current registration count of ${event._count.registrations}`
        });
      }

      const updatedData = { ...updates };
      if (updates.startDate) updatedData.startDate = new Date(updates.startDate);
      if (updates.endDate) updatedData.endDate = new Date(updates.endDate);
      if (updates.registrationDeadline) updatedData.registrationDeadline = new Date(updates.registrationDeadline);

      const updatedEvent = await prisma.event.update({
        where: { id },
        data: updatedData
      });

      return res.status(200).json({
        success: true,
        message: "Event updated successfully",
        data: { event: updatedEvent }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Event update validated, but awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Event model schema"
      },
      data: { id, updates }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDatabaseReady() && prisma?.event) {
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          _count: {
            select: { registrations: true }
          }
        }
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: `Event not found with ID: ${id}`
        });
      }

      const isOwner = req.user.id === event.organizerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to delete this event"
        });
      }

      if (event._count.registrations > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete event with active student registrations. Cancel the event instead."
        });
      }

      await prisma.event.delete({
        where: { id }
      });

      return res.status(200).json({
        success: true,
        message: "Event deleted successfully"
      });
    }

    return res.status(503).json({
      success: false,
      message: "Event deletion requested, but awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Event model schema"
      },
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

export const publishEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDatabaseReady() && prisma?.event) {
      const event = await prisma.event.findUnique({
        where: { id }
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: `Event not found with ID: ${id}`
        });
      }

      const isOwner = req.user.id === event.organizerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to publish this event"
        });
      }

      if (event.status === EVENT_STATUS.PUBLISHED) {
        return res.status(400).json({
          success: false,
          message: "Event is already published"
        });
      }

      if (event.status === EVENT_STATUS.COMPLETED || event.status === EVENT_STATUS.CANCELLED) {
        return res.status(400).json({
          success: false,
          message: `Cannot publish an event that is ${event.status.toLowerCase()}`
        });
      }

      if (!event.title || !event.description || !event.location || !event.capacity || event.capacity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot publish incomplete event. Title, description, location and positive capacity are required"
        });
      }

      if (new Date(event.startDate) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Cannot publish event with a past start date"
        });
      }

      const publishedEvent = await prisma.event.update({
        where: { id },
        data: {
          status: EVENT_STATUS.PUBLISHED,
          publishedAt: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        message: "Event published successfully",
        data: { event: publishedEvent }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Event publishing requested, but awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Event model schema"
      },
      data: {
        id,
        targetStatus: EVENT_STATUS.PUBLISHED
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizerEvents = async (req, res, next) => {
  try {
    const organizerId = req.user.id;

    if (isDatabaseReady() && prisma?.event) {
      const events = await prisma.event.findMany({
        where: { organizerId },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { registrations: true }
          }
        }
      });

      const metrics = {
        totalEvents: events.length,
        draftEvents: events.filter((e) => e.status === EVENT_STATUS.DRAFT).length,
        publishedEvents: events.filter((e) => e.status === EVENT_STATUS.PUBLISHED).length,
        totalRegistrations: events.reduce((sum, e) => sum + e._count.registrations, 0)
      };

      return res.status(200).json({
        success: true,
        data: {
          metrics,
          events
        }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Organizer events query is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Event model schema"
      },
      data: { organizerId }
    });
  } catch (error) {
    next(error);
  }
};

export const getEventStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDatabaseReady() && prisma?.event && prisma?.registration) {
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          registrations: {
            select: {
              status: true,
              department: true,
              createdAt: true
            }
          }
        }
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: `Event not found with ID: ${id}`
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

      const confirmed = event.registrations.filter((r) => r.status === "CONFIRMED").length;
      const cancelled = event.registrations.filter((r) => r.status === "CANCELLED").length;
      const capacityRemaining = Math.max(0, event.capacity - confirmed);
      const capacityFilledPercent = Math.min(100, Math.round((confirmed / event.capacity) * 100));

      const departmentBreakdown = {};
      for (const reg of event.registrations) {
        if (reg.status === "CONFIRMED" && reg.department) {
          departmentBreakdown[reg.department] = (departmentBreakdown[reg.department] || 0) + 1;
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          eventId: event.id,
          title: event.title,
          status: event.status,
          capacity: event.capacity,
          confirmedRegistrations: confirmed,
          cancelledRegistrations: cancelled,
          capacityRemaining,
          capacityFilledPercent,
          departmentBreakdown
        }
      });
    }

    return res.status(503).json({
      success: false,
      message: "Event statistics query is awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma Event/Registration model schemas"
      },
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};
