import { Router } from "express";
import { deleteAnnouncement } from "../controllers/announcement.controller.js";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { ROLES } from "../validators/auth.validator.js";

const router = Router();

router.delete("/:id", authenticate, authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN), deleteAnnouncement);

export default router;
