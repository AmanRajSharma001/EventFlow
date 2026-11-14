// Database helper functions for managing college events.
// Provides operations to fetch an event with safe public organizer details,
// create events with role and field validation, and update events with capacity safeguards.

import prisma from "../config/prisma.js";

// Fetches a single event by its ID along with public organizer details (id and name only).
// Computes registeredCount for active CONFIRMED registrations, ensuring sensitive fields like email and password are never leaked.
// Returns null if no event matches the given ID.
export async function getEventById(eventId) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          registrations: {
            where: { status: "CONFIRMED" },
          },
        },
      },
    },
  });

  if (!event) {
    return null;
  }

  return {
    ...event,
    registeredCount: event._count?.registrations ?? 0,
  };
}

// Creates a new event record in the database.
// Verifies that the creator is an authorized ORGANIZER or ADMIN.
// Validates title, capacity, and date sequence, and defaults status to DRAFT unless specified.
// Only copies whitelisted event fields to protect against unexpected or malicious property injection.
export async function createEvent(organizerId, data = {}) {
  // Check that the organizer exists and holds an authorized role
  const organizer = await prisma.user.findUnique({
    where: { id: organizerId },
    select: { id: true, role: true },
  });

  if (!organizer || (organizer.role !== "ORGANIZER" && organizer.role !== "ADMIN")) {
    throw new Error("Only organizers can create events");
  }

  // Validate that the title is provided and non-empty after trimming whitespace
  if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
    throw new Error("Title is required");
  }

  // Validate that capacity is a positive whole integer
  if (
    typeof data.capacity !== "number" ||
    !Number.isInteger(data.capacity) ||
    data.capacity <= 0
  ) {
    throw new Error("Capacity must be a positive whole number");
  }

  // Validate chronological ordering of event dates when optional dates are provided
  const startDate = new Date(data.startDate);
  const endDate = data.endDate ? new Date(data.endDate) : null;
  const registrationDeadline = data.registrationDeadline ? new Date(data.registrationDeadline) : null;

  if (endDate && endDate <= startDate) {
    throw new Error("End date must be after start date");
  }

  if (registrationDeadline && registrationDeadline >= startDate) {
    throw new Error("Registration deadline must be before the event starts");
  }

  // We explicitly select only permitted event attributes and ignore any extra fields (e.g. custom id).
  // This prevents callers from setting unauthorized properties or tampering with auto-generated primary keys.
  const eventData = {
    title: data.title.trim(),
    description: data.description || "",
    location: data.location || "",
    category: data.category ?? null,
    imageUrl: data.imageUrl ?? null,
    department: data.department ?? null,
    coordinator: data.coordinator ?? null,
    featured: typeof data.featured === "boolean" ? data.featured : false,
    price: data.price || "Free",
    tags: Array.isArray(data.tags) ? data.tags : [],
    startDate,
    endDate,
    registrationDeadline,
    capacity: data.capacity,
    status: data.status || "DRAFT",
    organizerId,
  };

  return await prisma.event.create({
    data: eventData,
  });
}

// Updates an existing event after verifying that the caller is the original organizer.
// Ensures capacity is never reduced below the number of students already actively confirmed.
// Merges and re-validates dates against the existing stored timestamps.
export async function updateEvent(eventId, organizerId, data = {}) {
  // Find the event to ensure it exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // Only the creator organizer is permitted to edit their event
  if (event.organizerId !== organizerId) {
    throw new Error("Only the event organizer can edit this event");
  }

  // If title is being updated, it must not be blank
  if (data.title !== undefined) {
    if (typeof data.title !== "string" || data.title.trim().length === 0) {
      throw new Error("Title is required");
    }
  }

  // If capacity is being updated, verify positive integer and check against current active registrations
  if (data.capacity !== undefined) {
    if (
      typeof data.capacity !== "number" ||
      !Number.isInteger(data.capacity) ||
      data.capacity <= 0
    ) {
      throw new Error("Capacity must be a positive whole number");
    }

    const currentRegistered = await prisma.registration.count({
      where: {
        eventId,
        status: "CONFIRMED",
      },
    });

    if (data.capacity < currentRegistered) {
      throw new Error("Capacity cannot be lower than current registrations");
    }
  }

  // Merge updated dates with existing stored dates to validate overall chronological consistency
  const finalStartDate = data.startDate !== undefined ? new Date(data.startDate) : event.startDate;
  const finalEndDate = data.endDate !== undefined
    ? (data.endDate ? new Date(data.endDate) : null)
    : event.endDate;
  const finalDeadline = data.registrationDeadline !== undefined
    ? (data.registrationDeadline ? new Date(data.registrationDeadline) : null)
    : event.registrationDeadline;

  if (finalEndDate && finalEndDate <= finalStartDate) {
    throw new Error("End date must be after start date");
  }

  if (finalDeadline && finalDeadline >= finalStartDate) {
    throw new Error("Registration deadline must be before the event starts");
  }

  // Whitelist fields permitted for update, ignoring any unknown or protected properties
  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.description !== undefined) updateData.description = data.description;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.department !== undefined) updateData.department = data.department;
  if (data.coordinator !== undefined) updateData.coordinator = data.coordinator;
  if (data.featured !== undefined) updateData.featured = Boolean(data.featured);
  if (data.price !== undefined) updateData.price = data.price;
  if (data.tags !== undefined) updateData.tags = Array.isArray(data.tags) ? data.tags : [];
  if (data.startDate !== undefined) updateData.startDate = finalStartDate;
  if (data.endDate !== undefined) updateData.endDate = finalEndDate;
  if (data.registrationDeadline !== undefined) updateData.registrationDeadline = finalDeadline;
  if (data.capacity !== undefined) updateData.capacity = data.capacity;
  if (data.status !== undefined) updateData.status = data.status;

  return await prisma.event.update({
    where: { id: eventId },
    data: updateData,
  });
}
