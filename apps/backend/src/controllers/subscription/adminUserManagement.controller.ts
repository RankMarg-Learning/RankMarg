import prisma from "@repo/db";
import { Request, Response, NextFunction } from "express";
import { ResponseUtil } from "@/utils/response.util";
import { Role } from "@repo/db/enums";
import { z } from "zod";
import bcrypt from "bcrypt";
import ServerConfig from "@/config/server.config";
import { createTrialSubscription } from "@/utils/subscription.util";

const createUserSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  username: z
    .string()
    .min(1, "Username is required")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username must contain only letters, numbers, or underscores"
    ),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["USER", "INSTRUCTOR", "ADMIN"]).optional().default("USER"),
});

export class AdminUserManagementController {
  /**
   * Get user details by unified search (searches through id, name, username, email, phone, location)
   */
  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query;

      if (!search || !search.toString().trim()) {
        ResponseUtil.error(res, "Please provide a search value", 400);
        return;
      }

      const searchTerm = search.toString().trim();

      // Build where clause with OR conditions to check all fields
      const whereClause: any = {
        OR: [
          { id: searchTerm },
          { username: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { phone: { contains: searchTerm, mode: "insensitive" } },
          { location: { contains: searchTerm, mode: "insensitive" } },
          { name: { contains: searchTerm, mode: "insensitive" } },
        ],
      };

      const user = await prisma.user.findFirst({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatar: true,
          phone: true,
          role: true,
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (!user) {
        ResponseUtil.error(res, "User not found", 404);
        return;
      }

      ResponseUtil.success(
        res,
        user,
        "User fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user role
   */
  updateUserRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.query;
      const { role } = req.body;

      if (!userId) {
        ResponseUtil.error(res, "Please provide userId", 400);
        return;
      }

      if (!role || !Object.values(Role).includes(role)) {
        ResponseUtil.error(res, "Invalid role", 400);
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId as string } });

      if (!user) {
        ResponseUtil.error(res, "User not found", 404);
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { role },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
        },
      });

      ResponseUtil.success(
        res,
        updatedUser,
        "User role updated successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update multiple user fields
   */
  updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.query;
      const updates = req.body;

      if (!userId) {
        ResponseUtil.error(res, "Please provide userId", 400);
        return;
      }

      // Remove fields that shouldn't be updated directly
      const { id, password, ...allowedUpdates } = updates;

      const user = await prisma.user.findUnique({ where: { id: userId as string } });

      if (!user) {
        ResponseUtil.error(res, "User not found", 404);
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: allowedUpdates,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatar: true,
          phone: true,
          role: true,
          standard: true,
          targetYear: true,
          studyHoursPerDay: true,
        },
      });

      ResponseUtil.success(
        res,
        updatedUser,
        "User updated successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new user
   */
  createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = createUserSchema.safeParse(req.body);

      if (!result.success) {
        ResponseUtil.error(res, result.error.errors[0].message, 400);
        return;
      }

      const { fullname, username, email, password, role } = result.data;

      // Check if email already exists
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        ResponseUtil.error(res, "Email already exists", 400);
        return;
      }

      // Check if username already exists
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        ResponseUtil.error(res, "Username already exists", 400);
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        password,
        ServerConfig.security.bcryptRounds || 10
      );

      // Create user with subscription
      const user = await prisma.user.create({
        data: {
          name: fullname,
          username,
          email,
          password: hashedPassword,
          provider: "credentials",
          role: role || Role.USER,
          subscription: {
            create: createTrialSubscription(),
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatar: true,
          phone: true,
          role: true,
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      ResponseUtil.success(
        res,
        user,
        "User created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a user
   */
  deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        ResponseUtil.error(res, "Please provide userId", 400);
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId as string } });

      if (!user) {
        ResponseUtil.error(res, "User not found", 404);
        return;
      }

      // Delete user (subscription will be deleted via cascade)
      await prisma.user.delete({
        where: { id: user.id },
      });

      ResponseUtil.success(
        res,
        null,
        "User deleted successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all users with pagination
   */
  getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      const role = req.query.role as string;

      const skip = (page - 1) * limit;

      // Build where clause
      const whereClause: any = {};

      if (search) {
        whereClause.OR = [
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ];
      }

      if (role) {
        whereClause.role = role;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
            phone: true,
            role: true,
            createdAt: true,
            subscription: {
              include: {
                plan: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      ResponseUtil.success(
        res,
        {
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        "Users fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };
}
