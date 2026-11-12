import prisma, { isDatabaseReady } from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { ROLES } from "../validators/auth.validator.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const assignedRole = role || ROLES.STUDENT;
    const hashedPassword = await hashPassword(password);

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

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

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
