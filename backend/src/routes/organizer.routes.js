import { Router } from "express";
import { getOrganizerDashboard } from "../controllers/analytics.controller.js";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { ROLES } from "../validators/auth.validator.js";

const router = Router();

router.get("/dashboard", authenticate, authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN), getOrganizerDashboard);

export default router;
