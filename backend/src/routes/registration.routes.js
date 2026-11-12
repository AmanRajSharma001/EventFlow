import { Router } from "express";
import {
  getMyRegistrations,
  cancelRegistration
} from "../controllers/registration.controller.js";
import { cancelRegistrationSchema } from "../validators/registration.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";
import { ROLES } from "../validators/auth.validator.js";

const router = Router();

router.get("/my", authenticate, authorizeRoles(ROLES.STUDENT), getMyRegistrations);
router.patch("/:id/cancel", authenticate, validate(cancelRegistrationSchema), cancelRegistration);

export default router;
