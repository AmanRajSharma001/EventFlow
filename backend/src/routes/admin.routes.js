import { Router } from "express";
import { getAdminDashboard } from "../controllers/analytics.controller.js";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { ROLES } from "../validators/auth.validator.js";

const router = Router();

router.get("/dashboard", authenticate, authorizeRoles(ROLES.ADMIN), getAdminDashboard);

export default router;
