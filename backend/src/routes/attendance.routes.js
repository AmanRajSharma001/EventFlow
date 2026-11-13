import { Router } from "express";
import {
  checkIn,
  manualCheckIn,
  getMyAttendance
} from "../controllers/attendance.controller.js";
import { checkInSchema, manualCheckInSchema } from "../validators/attendance.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { ROLES } from "../validators/auth.validator.js";

const router = Router();

router.post("/check-in", authenticate, authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN), validate(checkInSchema), checkIn);
router.post("/manual", authenticate, authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN), validate(manualCheckInSchema), manualCheckIn);
router.get("/my", authenticate, authorizeRoles(ROLES.STUDENT), getMyAttendance);

export default router;
