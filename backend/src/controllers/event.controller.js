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
