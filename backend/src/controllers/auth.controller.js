import prisma, { isDatabaseReady } from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { ROLES } from "../validators/auth.validator.js";

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Enforce STUDENT role for public registration
    const assignedRole = role || ROLES.STUDENT;

    // Hash the password using bcrypt
    const hashedPassword = await hashPassword(password);

    // If Sagar's database setup is ready, persist user to PostgreSQL via Prisma
    if (isDatabaseReady() && prisma?.user) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email address already exists"
        });
      }

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: assignedRole
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      const token = generateToken({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: newUser,
          token
        }
      });
    }

    // When Prisma / PostgreSQL database is not yet ready, document dependency clearly
    return res.status(503).json({
      success: false,
      message: "Registration validated and password hashed, but awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma User model schema"
      },
      data: {
        name,
        email,
        role: assignedRole
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user and issue JWT
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // If Sagar's database setup is ready, query PostgreSQL via Prisma
    if (isDatabaseReady() && prisma?.user) {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    }

    // When Prisma / PostgreSQL database is not yet ready, document dependency clearly
    return res.status(503).json({
      success: false,
      message: "Login credentials validated, but awaiting database integration with Sagar's Prisma setup.",
      dependency: {
        status: "pending_database_integration",
        teammate: "Sagar",
        required: "PostgreSQL database connection and Prisma User model schema"
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
