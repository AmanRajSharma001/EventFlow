import { Router } from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent
} from "../controllers/event.controller.js";
import {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema
} from "../validators/event.validator.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";
import { authenticate, authorizeRoles, optionalAuthenticate } from "../middleware/auth.middleware.js";
import { ROLES } from "../validators/auth.validator.js";

const router = Router();

router.get("/", optionalAuthenticate, validateQuery(eventQuerySchema), getEvents);
router.get("/:id", optionalAuthenticate, getEventById);
router.post("/", authenticate, authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN), validate(createEventSchema), createEvent);
router.patch("/:id", authenticate, authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN), validate(updateEventSchema), updateEvent);
router.delete("/:id", authenticate, authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN), deleteEvent);
router.patch("/:id/publish", authenticate, authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN), publishEvent);

export default router;
